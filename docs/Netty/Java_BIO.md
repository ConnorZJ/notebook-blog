---
title: Java BIO编程
date: 2021-01-19
categories:
 - Netty
tags:
 - netty
---

## Java BIO基本介绍

1. Java BIO就是传统的Java IO编程，其相关的类和接口在java.io包下。
2. BIO（Blocking I/O）：同步阻塞，服务器实现模式为一个连接一个线程，即客户端有连接请求时服务器端就需要启动一个线程进行处理。如果这个连接不做任何事情会造成不必要的线程开销，可以通过线程池机制改善。
3. BIO方式适用于数据数目比较小且固定的架构，这种方式对服务器资源要求比较高，并发局限于应用中，JDK1.4以前的唯一选择，程序简单易理解。

## Java BIO 工作机制

### 工作原理图

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic/Java_BIO.png)

### BIO编程简单流程

1. 服务器启动一个ServerSocket。
2. 客户端启动一个Socket对服务器进行通信，默认情况下，服务器端需要对每一个客户端建立一个线程与之通信。
3. 客户端发出请求后，先咨询服务器是否有线程相应，如果没有则会等待，或者被拒绝。
4. 如果有响应，客户端线程会等待请求结束后，再继续执行。



## Java BIO应用实例

### 实例说明

1. 使用BIO模型编写一个服务器端，监听6666端口，当有客户端连接时，就启动一个线程与之通讯。
2. 要求使用线程池机制改善，可以连接多个客户端。
3. 服务端可以接受客户端发送的数据。

### 代码实现

下面是服务端代码

```java
public class BIOServer {

    public static void main(String[] args) throws IOException {
        // 创建线程池
        ExecutorService executorService = Executors.newCachedThreadPool();
        // 创建ServerSocket并且监听6666端口
        ServerSocket serverSocket = new ServerSocket(6666);
        while (true) {
            // 监听---一直等待客户端连接
            Socket socket = serverSocket.accept();
            // 连接来了之后，启用一个线程去执行里面的方法
            executorService.execute(() -> {
                try {
                    // 获取客户端发送过来的输入流
                    InputStream inputStream = socket.getInputStream();
                    byte[] bytes = new byte[1024];
                    int read = inputStream.read(bytes);
                    // 读取发送过来的信息并打印
                    if (read != -1) {
                        System.out.println(new String(bytes, 0, read));
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    // 断开通讯
                    try {
                        socket.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

}
```

下面是客户端代码

```java
public class BIOClient {

    public static void main(String[] args) throws IOException {
        // 创建一个socket，并绑定本地ip及6666端口
        Socket socket = new Socket("127.0.0.1", 6666);
        // 获取output流
        OutputStream outputStream = socket.getOutputStream();
        // 向输出流中写入
        outputStream.write("Hello World!".getBytes());
        outputStream.flush();
        // 关闭连接
        socket.close();
    }

}
```

通过以上代码能够看到：在服务端的控制台中能有信息打印出来，且能得出结论：如果客户端一直没有请求发送，则服务端一直在等待；如果发送过来的数据是空的话，就会引起线程的消耗。

## Java BIO问题分析

1. 每个请求都需要创建独立的线程，与对应的客户端进行数据**读**，业务处理，然后再数据**写**。
2. 当并发数较大时，需要创建大量的线程来处理连接，系统资源占用较大。
3. 连接建立后，如果当前线程暂时没有数据可读，则线程就阻塞在**读**操作上，造成线程资源浪费。