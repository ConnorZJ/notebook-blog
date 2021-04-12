---
title: Netty模型及原理
date: 2021-02-19
categories:
 - Netty
tags:
 - netty
---

## Netty原理示意图

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Netty工作架构图.png)

这张图是我从网上复制下来的，因为这种图几乎完全的描述了Netty是如何工作的。

在Netty中，存在两组工作组，分别是`BossGroup`和`WorkerGroup`。这两者都是由若干个`NioEventLoopGroup`组成，而显然，`NioEventLoopGroup`是由`NioEventLoop`组成，一个`NioEventLoop`就是相对应一个线程，每一个`NioEventLoop`中存在一个`Selector`和任务队列，用来处理绑定在当前线程发生的事件。在`BossGroup`中的`NioEventLoopGroup`中，循环处理这`Accept`事件，不断地轮询并与`Client`建立连接，而处理时会将事件注册到某个`WorkGroup`中的某一`NioEventLoop`的`Selector`上，之后就会执行任务队列中的任务。在`WorkGroup`中，每一个`NioEventLoop`会轮询`Read/Write`事件并处理，也会去执行任务队列的任务。每一个`WorkGroup`中的线程进行处理操作的时候，会使用`Pipeline`（管道），`Pipeline`中包含许多的`ChannelHandler`，即能够通过其获取`Channel`通道。

### 入门实例

```java
public class NettyServer {

    public static void main(String[] args) throws InterruptedException {

        // 创建两个线程组 bossGroup、 workerGroup
        // bossGroup专门用来处理请求连接操作，真正与客户端业务操作，则交由workerGroup去处理
        /*
            在NioEventLoopGroup的构造方法中，一层一层的找，
            能看到默认的线程个数为核数*2（NettyRuntime.availableProcessors() * 2）
         */
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            // 创建启动对象，配置参数
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup) // 将两个线程组设置进来
                    .channel(NioServerSocketChannel.class) //指定NioServerSocketChannel作为通道的实现
                    .option(ChannelOption.SO_BACKLOG, 128)// 设置使用backlog参数，当请求来时按照顺序处理，来不及处理的放在队列中，此处设置了队列的长度为128
                    .childOption(ChannelOption.SO_KEEPALIVE, true)// 使用keepalive保持活动连接状态
                    .childHandler(new ChannelInitializer<SocketChannel>() { // 创建一个管道初始化对象
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new ServerChannelHandler());
                        }
                    });// 给workerGroup设置管道处理器

            System.out.println("服务器准备启动......");
            // 绑定端口并同步
            ChannelFuture channelFuture = bootstrap.bind(6666).sync();
            // 对通道关闭事件进行监听
            channelFuture.channel().closeFuture().sync();
        } catch (Exception e) {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

}
```

```java
public class ServerChannelHandler extends ChannelInboundHandlerAdapter {

    /**
     * 读取方法
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        Channel channel = ctx.channel();
        ByteBuf byteBuf = (ByteBuf) msg;
        System.out.println("客户端" + channel.remoteAddress() + "说：" + byteBuf.toString(CharsetUtil.UTF_8));
    }

    /**
     * 读取完毕之后的回调方法
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.writeAndFlush(Unpooled.copiedBuffer("Hello， 客户端!", CharsetUtil.UTF_8));
    }

    /**
     * 发生异常的处理方法，一般是关闭通道
     * @param ctx
     * @param cause
     * @throws Exception
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        ctx.close();
    }
}
```

```java
public class NettyClient {

    public static void main(String[] args) throws Exception {

        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(group)
                    .channel(NioSocketChannel.class)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new ClientChannelHandler());
                        }
                    });
            System.out.println("客户端准备好了......");
            ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 6666).sync();
            channelFuture.channel().closeFuture().sync();
        } catch (Exception e) {
            group.shutdownGracefully();
        }

    }

}
```

```java
public class ClientChannelHandler extends ChannelInboundHandlerAdapter {

    /**
     * 通道初始化方法
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ctx.writeAndFlush(Unpooled.copiedBuffer("Hello，服务端！", CharsetUtil.UTF_8));
    }

    /**
     * 读取方法
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        System.out.println(ctx);
        Channel channel = ctx.channel();
        ByteBuf byteBuf = (ByteBuf) msg;
        System.out.println("服务端" + channel.remoteAddress() + "说：" + byteBuf.toString(CharsetUtil.UTF_8));
    }

    /**
     * 发生异常的方法，一般是关闭通道
     * @param ctx
     * @param cause
     * @throws Exception
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        ctx.close();
    }
}
```

以上分别是使用Netty写的一个服务端和客户端通信的小demo，代码对应的注释已写明，有兴趣的话可以debugger一步一步的看。然而其中还有许多的类与方法并没有很明确的解释清楚，但由于篇幅关系，将在后面详细解释。

## 模型小结

1. Netty抽象出两组线程组，BossGroup专门负责接收客户端连接，WorkerGroup专门负责网络读写操作。
2. NioEventLoop表示一个不断循环执行处理任务的线程，每个NioEventLoop都有一个Selector，用于监听绑定在其上的Socket网络通道。
3. NioEventLoop内部采用串行化设计，从消息的读取->解码->编码->发送，始终由NioEventLoop负责。
4. - NioEventLoopGroup下包含多个NioEventLoop
   - 每个NioEventLoop中包含一个Selector，一个TaskQueue
   - 每个NioEventLoop的Selector上可以注册监听多个NioChannel
   - 每个NioChannel只会绑定在唯一的NioEventLoop上
   - 每个NioChannel都绑定有一个自己的ChannelPipeline