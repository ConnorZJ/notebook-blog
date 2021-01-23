---
title: 什么是Netty？
date: 2021-01-18
categories:
 - Netty
tags:
 - netty
---

## Netty的介绍

1. Netty是由JBOSS提供的一个Java开源框架，现为GitHub上的独立项目。
2. Netty是一个异步的、基于事件驱动的网络应用框架，用以快速开发高性能、高可靠的网络IO程序。
3. Netty主要针对在TPC/IP协议下，面向客户端的高并发应用，或者Peer-to-Peer场景下的大量数据持续传输的应用。
4. Netty本质是一个NIO的框架，适用于服务器通讯相关的多种应用场景。
5. 如果要透彻理解Netty，需要先学习NIO，这样才能方便阅读Netty的源码。

## Netty和Tomcat有什么区别？

Netty和Tomcat最大的区别就在于通信协议，Tomcat是基于Http协议的，他的实质是一个基于http协议的web容器，但是Netty不一样，他能通过编程自定义各种协议，因为netty能够通过codec自己来编码/解码字节流，完成类似redis访问的功能，这就是netty和tomcat最大的不同。



## Netty为什么并发高

Netty是一款基于NIO（Nonblocking I/O，非阻塞IO）开发的网络通信框架，对比于BIO（Blocking I/O，阻塞IO），他的并发性能得到了很大提高。

当一个连接建立之后，他有两个步骤要做，第一步是接收完客户端发过来的全部数据，第二步是服务端处理完请求业务之后返回response给客户端。NIO和BIO的区别主要是在第一步。
 在BIO中，等待客户端发数据这个过程是阻塞的，这样就造成了一个线程只能处理一个请求的情况，而机器能支持的最大线程数是有限的，这就是为什么BIO不能支持高并发的原因。
 而NIO中，当一个Socket建立好之后，Thread并不会阻塞去接受这个Socket，而是将这个请求交给Selector，Selector会不断的去遍历所有的Socket，一旦有一个Socket建立完成，他会通知Thread，然后Thread处理完数据再返回给客户端——**这个过程是不阻塞的**，这样就能让一个Thread处理更多的请求了。



## Netty的特点

1. 设计优雅：适用于各种传输类型的统一API阻塞和非阻塞Socket；基于灵活且可扩展的事件模型，可以清晰地分离关注点；高度可定制的线程模型，一个或多个线程池；真正的无连接数据包套接字支持（自3.1起）。
2. 使用方便：详细记录的JavaDoc，用户指南和实例；没有其他依赖项，JDK5（Netty 3.x）或6（Netty 4.x）就足够了。
3. 高性能、吞吐量更高；延迟更低；减少资源消耗；最小化不必要的内存复制。
4. 安全：完整的SSL/TLSheStartTLS支持。
5. 社区活跃、不断更新；社区活跃，版本迭代周期短，发现的Bug可以及时被修复，同时，更多的新功能会被加入。

摘自<https://www.cnblogs.com/imstudy/p/9908791.html>

## Netty 常见使用场景
1. 互联网行业：在分布式系统中，各个节点之间需要远程服务调用，高性能的 RPC 框架必不可少，Netty 作为异步高性能的通信框架，往往作为基础通信组件被这些 RPC 框架使用。典型的应用有：阿里分布式服务框架 Dubbo 的 RPC 框架使用 Dubbo 协议进行节点间通信，Dubbo 协议默认使用 Netty 作为基础通信组件，用于实现各进程节点之间的内部通信。

2. 游戏行业：无论是手游服务端还是大型的网络游戏，Java 语言得到了越来越广泛的应用。Netty 作为高性能的基础通信组件，它本身提供了 TCP/UDP 和 HTTP 协议栈。非常方便定制和开发私有协议栈，账号登录服务器，地图服务器之间可以方便的通过 Netty 进行高性能的通信。

3. 大数据领域：经典的 Hadoop 的高性能通信和序列化组件 Avro 的 RPC 框架，默认采用 Netty 进行跨界点通信，它的 Netty Service 基于 Netty 框架二次封装实现。

摘自<https://www.cnblogs.com/imstudy/p/9908791.html>

