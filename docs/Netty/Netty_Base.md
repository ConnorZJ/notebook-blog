---
title: Netty概述及线程模型
date: 2021-02-02
categories:
 - Netty
tags:
 - netty
---

## 原生NIO存在的问题

1. NIO的类库和API繁杂，使用麻烦，需要熟练掌握Selector、ServerSocketChannel、SocketChannel、ByteBuffer等。
2. 需要具备其他的额外技能：要熟悉Java多线程编程，因为NIO编程涉及到Reactor模式，你必须对多线程和网络编程非常熟悉，才能编写出高质量的NIO程序。
3. 开发工作量和难度都非常大：例如客户端面临的断连重连、网络闪断、半包读写、失败缓存、网络拥塞和异常流的处理等等。
4. JDK NIO的bug：例如臭名昭著的Epoll Bug，他会导致Selector空轮询，最终导致CPU 100%。直到JDK1.7版本该问题仍旧存在，没有被根本解决。

## Netty官网说明

官网：https://netty.io/

> Netty is an asynchronous event-driven network application framework for rapid development of maintainable high performance protocol servers & clients.
>
> Netty是一个异步的、事件驱动的网络应用框架，能够快速构建一个可维护的高性能协议服务端和客户端。





![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Netty.png)

1. Netty是由JBOSS提供的一个Java开源框架，Netty提供一步的、基于事件驱动的网络应用程序框架，用以快速开发高性能、高可靠的网络IO程序。
2. Netty可以帮助你快速、简单的开发出一个网络应用，相当于简化和流程化了NIO的开发过程。
3. Netty是目前最流行的NIO框架，Netty在互联网领域、大数据分布式计算领域、游戏行业、通信行业等获得了广泛的应用，知名的ElasticSearch、Dubbo框架内部都采用了Netty。

## Netty的优点

Netty对JDK自带的NIO的API进行了封装，解决了上述问题。

1. 设计优雅：适用于各种传输类型的统一API阻塞和非阻塞Socket；基于灵活且可扩展的事件模型，可以清晰地分离关注点；高度可定制的线程模型-单线程，一个或多个线程池。
2. 使用方便：详细记录的Javadoc，用户指南和示例；没有其他依赖项，JDK5->Netty3.x，JDK6->Netty4.x。
3. 高性能、吞吐量更高；延迟更低；减少资源消耗；最小化不必要的内存复制。
4. 安全：完整的SSL/TLS和StartTLS支持。
5. 社区活跃、不断更新，版本迭代周期短，发现的Bug可以被及时的修复。同时，更多的新功能会被加入。

## 线程模型

不同的线程模型，对程序的性能有很大影响，为了搞清Netty线程模型，我们来系统的讲解下各个线程模式，最后看看Netty线程模型有什么优越性。

目前存在的线程模型有：

- 传统阻塞I/O服务模型
- Reactor模型

根据Reactor的数量和处理资源池线程的数量不同，有3中典型的实现：

- 单Reactor单线程；
- 单Reactor多线程；
- 主从Reactor多线程。

而Netty线程模式主要基于主从Reactor多线程模型，并做了一定的改进，其中主从Reactor多线程模型有多个Reactor。

下面来看看，线程模型具体是什么样子的！

### 传统阻塞I/O服务模型

#### 工作原理图

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/传统阻塞I/O服务模型.png)

#### 模型特点

1. 采用阻塞IO模式获取输入的数据。
2. 每个连接都需要独立的线程完成数据的输入，业务梳理，数据返回。

#### 问题分析

1. 当并发数很大，就会创建大量的线程，占用很大的系统资源。
2. 连接创建后，如果当前线程暂时没有数据可读，该线程会阻塞在read操作，造成线程资源浪费。

### Reactor模型

针对传统阻塞I/O服务模型的2个缺点，解决方案如下：

1. 基于I/O服用模型：多个连接共用一个阻塞对象，应用程序只需要在一个阻塞对象等待，无需阻塞等待所有连接。当某个连接有新的数据可以处理时，操作系统通知应用程序，线程从阻塞状态返回，开始进行业务处理。
2. 基于线程池服用线程资源：不必再为每个链接创建线程，将连接完成后的业务处理任务分配给线程进行处理，一个线程可以处理多个连接的业务。

#### 工作原理图

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor模型.png)

I/O复用结合线程池，就是Reactor模式基本设计思想。

#### 图例说明

1. Reactor模式，通过一个或多个输入同时船体给服务处理器的模式（基于事件驱动）。
2. 服务器端程序处理传入的多个请求，并将它们同步分派到相应的处理线程，因此Reactor模式也叫Dispatcher模式。
3. Reactor模式使用IO复用监听事件，收到事件后，分发给某个线程（进程），这点就是网络服务器高并发处理关键。

#### Reactor模式中核心组成

1. Reactor：Reactor在一个单独的线程中运行，负责监听和分发事件，分发给适当的处理程序来对IO事件作出反应，它就像公司的电话接线员，它接听来自客户的电话并将线路转移到适当的联系人。
2. Handlers：处理程序执行I/O事件要完成的实际事件，类似于客户想要与之交谈的公司中的实际官员。Reactor通过调度适当的处理程序来响应I/O事件，处理程序执行非阻塞操作。



### Reactor单线程

#### 模型图例

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor单线程模式.png)

通过图例可以知道，在应用程序中，有多个客户端Client能够发起请求，连接到服务器端。然后由服务器端的Reactor中的Dispatcher来分发请求，先讲请求发送给Acceptor进行连接操作；连接操作成功后，再转交给Handler去进行具体的业务操作。

单线程的Reactor模型就是这么的简单明了，了解了之后，很容易就能通过图例去进行简单的编码操作。

#### 代码示例

根据模型图例，可以得出以下代码

```java
/**
 * Reactor单线程模型
 * @author connor
 */
public class SingleThreadReactor implements Runnable {

    /**
     * 定义服务器通道、选择器和端口
     */
    private ServerSocketChannel serverSocketChannel;
    private Selector selector;
    private static final int PORT = 6666;

    /**
     * 在构造方法中，初始化属性
     *
     * @throws IOException
     */
    public SingleThreadReactor() throws IOException {
        serverSocketChannel = ServerSocketChannel.open();
        // 设置非阻塞
        serverSocketChannel.configureBlocking(false);
        // 绑定端口
        serverSocketChannel.socket().bind(new InetSocketAddress(PORT));
        selector = Selector.open();
        // 将通道注册到选择器上，监听accept事件，并且新建一个Acceptor对象作为附带对象
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT, new Acceptor(serverSocketChannel, selector));
    }

    @Override
    public void run() {
        while (true) {
            try {
                int select = selector.select();
                if (select > 0) {
                    // 取出已发生事件的selectionKeys
                    Set<SelectionKey> selectionKeys = selector.selectedKeys();
                    Iterator<SelectionKey> keyIterator = selectionKeys.iterator();
                    while (keyIterator.hasNext()) {
                        SelectionKey selectionKey = keyIterator.next();
                        // 使用分发器分发事件
                        dispatcher(selectionKey);
                        keyIterator.remove();
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 分发事件
     *
     * @param selectionKey
     */
    private void dispatcher(SelectionKey selectionKey) {
        Runnable runnable = (Runnable) selectionKey.attachment();
        runnable.run();
    }

    public static void main(String[] args) throws IOException {
        SingleThreadReactor str = new SingleThreadReactor();
        str.run();
    }

}
```

依据图例，是一个Reactor接受来自客户端的请求，然后通过分发器将请求分发到Acceptor和Handler上。

```java
/**
 * 接收器
 *
 * @author connor
 */
public class Acceptor implements Runnable {
    // 定义通道和选择器
    private ServerSocketChannel serverSocketChannel;
    private Selector selector;

    /**
     * 构造方法中，初始化属性
     *
     * @param serverSocketChannel
     * @param selector
     */
    public Acceptor(ServerSocketChannel serverSocketChannel, Selector selector) {
        this.serverSocketChannel = serverSocketChannel;
        this.selector = selector;
    }

    @Override
    public void run() {
        SocketChannel socketChannel = null;
        try {
            // 接受连接请求
            socketChannel = serverSocketChannel.accept();
            socketChannel.configureBlocking(false);
            // 将通道注册到选择器上，并且监听read事件
            SelectionKey selectionKey = socketChannel.register(selector, SelectionKey.OP_READ);
            // 新建一个Handler对象作为附带对象
            selectionKey.attach(new Handler(socketChannel));
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
```

```java
public class Handler implements Runnable
{

   private SocketChannel socketChannel;

   public Handler(SocketChannel socketChannel)
   {
      this.socketChannel = socketChannel;
   }

   @Override
    public void run() {
        ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
        try {
            int read = socketChannel.read(byteBuffer);
            if (read > 0) {
                System.out.println("客户端：" + socketChannel.getRemoteAddress() + "发来消息：" + new String(byteBuffer.array()));
                socketChannel.write(ByteBuffer.wrap(("来自服务端：" + socketChannel.getLocalAddress() + "的响应成功...").getBytes(StandardCharsets.UTF_8)));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

测试结果为：

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor代码测试结果1.png)

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor代码测试结果2.png)

#### Reactor单线程模型的优缺点

Reactor单线程模型的优点是模型简单，没有多线程，所以少了多核竞争资源的问题。

但单线程模型缺点也很明显，那就是一个线程无法发挥多核CPU的优势，在Handler线程处理时，会产生阻塞，无法发挥NIO一个线程真正处理多个客户端的优势。

### Reactor多线程模型

#### 模型图例

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor多线程模型.png)

Reactor多线程比单线程多的一个地方就是，Handler不再自己单线程的处理业务，而是交由一个线程池，每次有东西需要执行的时候，都让线程池起一个线程去执行，而Handler不用阻塞在那里，线程执行完了之后，自行将结果写入通道中，返回给客户端。

#### 代码示例

下列代码与单线程模型代码基本一致，只是增加了一个Process类。

```java
/**
 * 处理器
 *
 * @author connor
 */
public class Handler implements Runnable {

    private ExecutorService executors = Executors.newFixedThreadPool(2);

    private SocketChannel socketChannel;

    public Handler(SocketChannel socketChannel) {
        this.socketChannel = socketChannel;
    }

    @Override
    public void run() {
        ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
        executors.execute(new Process(socketChannel, byteBuffer));
    }

}
```

```java
/**
 * 操作
 *
 * @author connor
 */
public class Process implements Runnable {

    private SocketChannel socketChannel;
    private ByteBuffer byteBuffer;

    public Process(SocketChannel socketChannel, ByteBuffer byteBuffer) {
        this.socketChannel = socketChannel;
        this.byteBuffer = byteBuffer;
    }

    @Override
    public void run() {
        try {
            int read = socketChannel.read(byteBuffer);
            if (read > 0) {
                System.out.println("客户端：" + socketChannel.getRemoteAddress() + "发来消息：" + new String(byteBuffer.array()));
                socketChannel.write(ByteBuffer.wrap(("来自服务端：" + socketChannel.getLocalAddress() + "的响应成功...").getBytes(StandardCharsets.UTF_8)));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

代码运行结果如下：

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor多线程结果1.png)

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor多线程结果2.png)

#### Reactor多线程模型优缺点

1. 优点：可以充分的利用多核 cpu 的处理能力
2. 缺点：多线程数据共享和访问比较复杂，Reactor 处理所有的事件的监听和响应，在单线程运行，在高并发场景容易出现性能瓶颈。

### Reactor主从模型

#### 模型图例

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Reactor主从模型.png)

1. `Reactor` 主线程 `MainReactor` 对象通过 `select` 监听连接事件，收到事件后，通过 `Acceptor` 处理连接事件
2. 当 `Acceptor` 处理连接事件后，`MainReactor` 将连接分配给 `SubReactor`
3. `subreactor` 将连接加入到连接队列进行监听，并创建 `handler` 进行各种事件处理
4. 当有新事件发生时，`subreactor` 就会调用对应的 `handler` 处理
5. `handler` 通过 `read` 读取数据，分发给后面的 `worker` 线程处理
6. `worker` 线程池分配独立的 `worker` 线程进行业务处理，并返回结果
7. `handler` 收到响应的结果后，再通过 `send` 将结果返回给 `client`
8. `Reactor` 主线程可以对应多个 `Reactor` 子线程，即 `MainRecator` 可以关联多个 `SubReactor`

#### 代码示例

```java
public class Reactor implements Runnable {
    private ServerSocketChannel serverSocketChannel;

    private Selector selector;

    public Reactor(int port) {
        try {
            serverSocketChannel = ServerSocketChannel.open();
            selector = Selector.open();
            serverSocketChannel.configureBlocking(false);
            serverSocketChannel.socket().bind(new InetSocketAddress(port));
            SelectionKey selectionKey = serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
            selectionKey.attach(new Acceptor(serverSocketChannel));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        try {
            while (true) {
                selector.select();
                Set<SelectionKey> selectionKeys = selector.selectedKeys();
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()) {
                    SelectionKey selectionKey = iterator.next();
                    dispatcher(selectionKey);
                    iterator.remove();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void dispatcher(SelectionKey selectionKey) {
        Runnable runnable = (Runnable) selectionKey.attachment();
        runnable.run();
    }
    
    public static void main(String[] args) {
        Reactor reactor = new Reactor(9090);
        reactor.run();
    }
    
}
```

```java
public class Acceptor implements Runnable {
    private ServerSocketChannel serverSocketChannel;
    private final int CORE = 8;

    private int index;

    private SubReactor[] subReactors = new SubReactor[CORE];
    private Thread[] threads = new Thread[CORE];
    private final Selector[] selectors = new Selector[CORE];

    public Acceptor(ServerSocketChannel serverSocketChannel) {
        this.serverSocketChannel = serverSocketChannel;
        for (int i = 0; i < CORE; i++) {
            try {
                selectors[i] = Selector.open();
            } catch (IOException e) {
                e.printStackTrace();
            }
            subReactors[i] = new SubReactor(selectors[i]);
            threads[i] = new Thread(subReactors[i]);
            threads[i].start();
        }
    }

    @Override
    public void run() {
        try {
            System.out.println("acceptor thread:" + Thread.currentThread().getName());
            SocketChannel socketChannel = serverSocketChannel.accept();
            System.out.println("有客户端连接上来了," + socketChannel.getRemoteAddress());
            socketChannel.configureBlocking(false);
            selectors[index].wakeup();
            SelectionKey selectionKey = socketChannel.register(selectors[index], SelectionKey.OP_READ);
            selectionKey.attach(new WorkHandler(socketChannel));
            if (++index == threads.length) {
                index = 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

```java
public class SubReactor implements Runnable {
    private Selector selector;

    public SubReactor(Selector selector) {
        this.selector = selector;
    }


    @Override
    public void run() {
        while (true) {
            try {
                selector.select();
                System.out.println("selector:" + selector.toString() + "thread:" + Thread.currentThread().getName());
                Set<SelectionKey> selectionKeys = selector.selectedKeys();
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()) {
                    SelectionKey selectionKey = iterator.next();
                    dispatcher(selectionKey);
                    iterator.remove();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void dispatcher(SelectionKey selectionKey) {
        Runnable runnable = (Runnable) selectionKey.attachment();
        runnable.run();
    }
}
```

```java
public class WorkHandler implements Runnable {
    private SocketChannel socketChannel;

    public WorkHandler(SocketChannel socketChannel) {
        this.socketChannel = socketChannel;
    }

    @Override
    public void run() {
        try {
            ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
            socketChannel.read(byteBuffer);
            String message = new String(byteBuffer.array(), StandardCharsets.UTF_8);
            System.out.println(socketChannel.getRemoteAddress() + "发来的消息是:" + message);
            socketChannel.write(ByteBuffer.wrap("你的消息我收到了".getBytes(StandardCharsets.UTF_8)));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### Reactor主从模型优缺点

优点：父线程与子线程的数据交互简单职责明确，父线程只需要接收新连接，子线程完成后续的业务处理。而且父线程与子线程的交互也比较简单，主线程只需要把新连接传给子线程，子线程无需返回数据。

缺点：能看得到，主从模型还是非常复杂的，代码量也非常多。

## Netty的模型

说了这么多，我们的主线——Netty还没有讲到。

其实Netty采用的就是上述的Reactor主从模型，而且在其上还进一步改进了许多。接下来还要深入的理解学习，才能通俗的把Netty的知识分享出来。敬请期待！