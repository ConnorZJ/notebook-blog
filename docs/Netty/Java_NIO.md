---
title: Java NIO编程
date: 2021-01-22
categories:
 - Netty
tags:
 - netty
---

## Java NIO基本介绍

1. Java NIO全称java non-blocking IO，是指JDK提供的新API。从JDK1.4开始，提供了一系列改进的输入/输出的新特性，被统称为NIO（所以也可称为New IO），是同步非阻塞的。
2. NIO相关类都被放在java.nio包及子包下，并且对原java.io包中的很多类进行改写。
3. NIO有三大核心部分：
   - Channel（通道）
   - Buffer（缓冲区）
   - Selector（选择器）
4. NIO是面向缓冲区的。数据读取到一个它的稍后处理的缓冲区，需要时可以在缓冲区中前后移动，这就增加了处理过程中的灵活性，使用它可以提供非阻塞式的高伸缩性网络。
5. Java NIO的非阻塞模式，是一个线程从某通道发送请求或者读取数据，但是它仅能得到目前可用的数据，如果目前没有数据可用时，就什么都不会获取，而不是保持线程阻塞，所以直至数据变得可以读取之前，该线程可以继续做其他的事情。非阻塞写也是如此，一个线程请求写入一些数据到某通道，但不需要等待它完全写入，这个线程同时可以去做别的事情。
6. 通俗理解：NIO是可以做到用一个线程来处理多个操作的。假设有10000个请求过来，根据实际情况，可以分配50或者100个线程来处理。不像之前的阻塞IO那样，非得分配10000个。
7. HTTP2.0使用了多路复用的技术，做到了同一个连接并发处理多个请求，而且并发请求的数量比HTTP1.1大了好几个数量级。

### NIO和BIO的比较

1. BIO以流的方式处理数据，而NIO以块的方式处理数据，块I/O的效率比流I/O高很多。
2. BIO是阻塞的，NIO则是非阻塞的。
3. BIO基于字节流和字符流进行操作，而NIO基于Channel（通道）和Buffer（缓冲区）进行操作，数据总是从通道读取到缓冲区中，或者冲缓冲区写入到通道中。Selector（选择器）用于监听多个通道的事件（比如：连接请求，数据到达等），因此使用单个线程就可以监听多个客户端通道。

### Java NIO示意图

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Java_NIO.png)

从此图可以看出，一个Server端能启用多个线程，一个线程持有一个Selector对象，一个Selector对象控制多个Channel管道，一个Channel和一个Client客户端之间只有一个Buffer缓冲区，所以数据的读写都是面向Buffer缓冲区的。

## Buffer缓冲区

### 基本介绍

Buffer（缓冲区）：缓冲区本质上是一个可以读写数据的内存块，可以理解成是一个容器对象（含数组），该对象提供了一组方法，可以更轻松的使用内存块，缓冲区对象内置了一些机制，能够跟踪和记录缓冲区的状态变化情况。Channel提供从文件、网络读取数据的渠道，但是读取或写入的数据都必须经由Buffer。

在java.nio包下，Buffer是一个顶级父类，是一个抽象类，类的层级关系如下所示：

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Buffer.png)

一共有7个类直接继承了Buffer类，这7个子类分别是除了boolean外的其他7中数据类型的Buffer类。

在这七个子类中，都有一个相应数据类型的数组，比如IntBuffer中就有一个int类型的数组：

```java
final int[] hb;  
```

在ByteBuffer类中就有一个byte类型的数组：

```java
final byte[] hb;   
```

在使用Buffer进行数据读写的时候，主要是通过底层的这个数组来储存数据，但是具体的控制数据读写，是通过父类Buffer中的以下参数来控制的：

```java
// Invariants（不变关系）: mark <= position <= limit <= capacity
private int mark = -1;
private int position = 0;
private int limit;
private int capacity;
```

这四个属性的描述以下所示：

| 属性     | 描述                                                         |
| -------- | :----------------------------------------------------------- |
| Capacity | 容量，即可以容纳的最大数据量。在缓冲区被创建时被确定并且不能改变 |
| Limit    | 表示缓冲区的当前终点，不能对缓冲区超过limit的位置进行读写操作，且limit是可以修改的 |
| Position | 位置，下一个要被读/写的元素的索引，每次读写缓冲区数据时都会改变position的值，为下次读写做准备 |
| Mark     | 标记                                                         |

### 代码示例

以下代码可以做个示例，有兴趣的在IDE中打个断点一步一步看看Buffer的四个参数是如何变化的：

```java
public static void main(String[] args) {
    // 创建一个IntBuffer对象实例，分配容量为5
    IntBuffer buffer = IntBuffer.allocate(5);
    for (int i = 0; i < buffer.capacity(); i++) {
        // 每次循环为buffer塞一个int类型的数值，经过5次循环后，buffer中应该有0、2、4、6、8这5个数
        buffer.put(i * 2);
    }
    // 当要将buffer从写入转换到读取的时候，需要调用flip()方法
    // flip()方法是将limit指向position的位置，并且再将position置0
    // 表示从头再读到调用flip()方法的地方
    buffer.flip();
    // hasRemaining()方法表示是否还有剩余的元素可读取
    // 里面是通过position < limit判断是否有剩余的元素
    while (buffer.hasRemaining()) {
        System.out.println(buffer.get());
    }
    // 这时将position的位置设置成1，limit的位置设置成4
    buffer.position(1);
    buffer.limit(4);
    // 因为不能读取超过limit的元素，并且从position位置开始读取，所以这里将会输出2、4、6
    while (buffer.hasRemaining()) {
        System.out.println(buffer.get());
    }

}
```

## 通道（Channel）

### 基本介绍

1. NIO的通道类似于流，但两者之间有所区别：
   - 通道可以同时进行读写，而流只能读或者只能写
   - 通道可以实现异步读写数据
   - 通道可以从缓冲区读取数据，也可以写数据到缓冲区
2. BIO的stream是单向的，例如FileInputStream对象只能进行读取数据的操作，而NIO中的通道（Channel）是双向的，可以读操作，也可以写操作。
3. Channel在NIO中是一个**接口**。
4. 常用的Channel类有：``FileChannel``、``DatagramChannel``、``ServerSocketChannel``、``SocketChannel``。``FileChannel``用于文件的数据读写，``DatagramChannel``用于UDP的数据读写，``ServerSocketChannel``和``SocketChannel``用于TCP的数据读写。

### 代码示例

```java
public static void main(String[] args) throws Exception {
    // 从桌面上随机取一张图片进行复制操作
    // 获取原图片和被复制图片路径的流
    FileInputStream fileInputStream = new FileInputStream("/Users/connor/Desktop//64535234_p0.png");
    FileOutputStream fileOutputStream = new FileOutputStream("/Users/connor/Desktop//64535234_p0_1.png");
    // 通过流的getChannel()方法获取两个通道
    FileChannel fileInputStreamChannel = fileInputStream.getChannel();
    FileChannel fileOutputStreamChannel = fileOutputStream.getChannel();
    // 创建一个字节类型的缓冲区，并为其分配1024长度
    ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
    // 每次读取图片的字节到缓冲区，当读返回-1时，表示读完了
    while (fileInputStreamChannel.read(byteBuffer) > -1) {
        // 调用flip()方法，从读的状态变为写的状态
        byteBuffer.flip();
        // 复制，将缓冲区中的数据写入到管道中
        fileOutputStreamChannel.write(byteBuffer);
        // 将缓冲区清空，以便于下一次读取
        byteBuffer.clear();
    }
    // 关闭Closeable对象
    fileOutputStreamChannel.close();
    fileInputStreamChannel.close();
    fileOutputStream.close();
    fileInputStream.close();
}
```

通过以上方法可以实现文件的拷贝，但是FileChannel中还有一个方法，那就是transferTo/transferFrom，甚至能更快地进行复制操作：

```java
public static void main(String[] args) throws IOException {
    // 从桌面上随机取一张图片进行复制操作
    // 获取原图片和被复制图片路径的流
    FileInputStream fileInputStream = new FileInputStream("/Users/connor/Desktop//64535234_p0.png");
    FileOutputStream fileOutputStream = new FileOutputStream("/Users/connor/Desktop//64535234_p0_1.png");
    // 通过流的getChannel()方法获取两个通道
    FileChannel fileInputStreamChannel = fileInputStream.getChannel();
    FileChannel fileOutputStreamChannel = fileOutputStream.getChannel();
    // transferTo同理，在fileInputStreamChannel中调用
    fileOutputStreamChannel.transferFrom(fileInputStreamChannel,0,fileInputStreamChannel.size());
    // 关闭Closeable对象
    fileOutputStreamChannel.close();
    fileInputStreamChannel.close();
    fileOutputStream.close();
    fileInputStream.close();
}
```

## Selector（选择器）

### 基本介绍

1. Java的NIO，用非阻塞的IO方式。可以用一个线程，处理多个的客户端连接，就会使用到Selector（选择器）。
2. Selector能够检测多个注册的通道上是否有事件发生，如果有事件发生，便获取时间然后针对每个事件进行相应的处理。这样就可以只用一个单线程去管理多个通道，也就是管理多个连接和请求。
3. 只有在连接通道真正有读写事件发生时，才会进行读写，就大大地减少了系统开销，并且不必为每一个连接都创建一个线程，不用去维护多个线程。避免了多个线程之间的上下文切换导致的开销。

### SelectionKey

SelectionKey为Selector中，有一个Channel注册了，就会生成一个SelectionKey对象，在同步非阻塞中，Selector可以通过SelectionKey找到相应的Channel并处理。

SelectionKey在Selector和Channel的注册关系中一共分为四种：

- Int OP_ACCEPT：有新的网络连接可以accept，值为16（1<<4）
- int OP_CONNECT：代表连接已经建立，值为8(1<<3)
- int OP_WRITE：代表写操作，值为4(1<<2)
- int OP_READ：代表读操作，值为1(1<<0)

