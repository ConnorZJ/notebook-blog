---
title: Netty概述
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