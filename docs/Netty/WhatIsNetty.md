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