---
title: 类加载器子系统
date: 2020-12-017
categories:
 - JVM
tags:
 - JVM
---



## 类加载器子系统

- 类加载子系统负责从文件系统或者网络中加载class文件，class文件在文件开头有特定的文件标识。
- ClassLoader只负责class文件的加载，至于它是否可以运行，则由执行引擎（Execution Engine）决定。
- 加载的类信息存放于一块成为方法区的内存空间。除了类的信息外，方法区中还会存放运行时常量池信息，可能还包括字符串字面量和数字常量（这部分常量信息是Class文件中常量池部分的内存映射）。

## 类加载过程

![](https://connorzj.oss-cn-shenzhen.aliyuncs.com/blog-pic类加载过程.png)

1. 加载

- 通过一个类的全限定名获取定义此类的二进制字节流；
- 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构
- 在内存中生成一个代表这个类的java.lang.Class对象，作为方法区这个类的各种数据的访问入口。

2. 链接

   （1）验证

   - 目的在于确保class文件的字节流中包含信息符合当前虚拟机要求，保证被加载的类的正确性。

   - 主要包括四种验证：文件格式验证，元数据验证，字节码验证，符号引用验证。

   （2）准备
   
   - 为类变量分配内存并且设置该类变量的默认初始值，即零值。
   - 这里不包含用final修饰的static，因为final在编译的时候就会分配了，准备阶段会显式初始化。
   - 这里不会为实例化变量分配初始化，因为类变量会分配在方法区中，而实例变量是会随着对象一起分配到Java堆中。
   
   （3）解析
   
   - 将常量池内的符号引用转换为直接引用的过程。
   - 解析操作往往会伴随着JVM在执行完成初始化之后再执行。
   - 符号引用就是一组符号来描述所引用的目标，符号引用的字面量形式明确定义在《Java虚拟机规范》的class文件格式中，直接引用就是直接指向目标的指针，相对偏移量或一个简介定位到目标的句柄。
   - 解析动作主要针对类或接、字段、类方法、接口方法、方法类型等。

3. 初始化
- 初始化阶段就是执行类的构造器方法&lt;clinit&gt;()的过程
- 此方法不需要定义，是javac编译器自动收集类中的而所有类变量的赋值动作和静态代码块中的语句合并而来。
- **构造器方法中指令按语句在源文件中出现的顺序执行**
- &lt;clinit&gt;()不同于类的构造器（构造器是&lt;init&gt;()）
- 若该类具有父类，JVM会保证子类的&lt;clinit&gt;()执行前，父类的&lt;clinit&gt;()已经执行完毕
- 虚拟机必须保证一个类的&lt;clinit&gt;()方法在多线程下被同步加载（只被加载一次）

## 类加载器的分类

- JVM支持两种类型的类加载器，分别为**引导类加载器（Bootstrap ClassLoader）**和**自定义类加载器（User-Defined ClassLoader）**。
- 从概念上来讲，自定义加载器一般指的是程序中由开发人员自定义的一类类加载器，但是Java虚拟机规范却没有这么定义，而是将所有派生于抽象类ClassLoader的类加载器都划分为自定义类加载器，因为引导类加载器为C/C++语言编写的，其他包括扩展类加载器和系统类加载器都是由Java语言开发的。
- 无论类加载器的类型如何划分，在程序中，我们最常见的类加载器始终只有3个---引导类加载器（Bootstrap ClassLoader）、扩展类加载器（Extension ClassLoader）、系统类加载器（System ClassLoader）。

### 引导类加载器（启动类加载器，Bootstrap ClassLoader）

- 这个类加载器使用C/C++语言实现的，嵌套在JVM内部。
- 它用来加载Java的核心库（JAVA_HOME/jre/lib/rt.jar、resources.jar或sun.boot.class.path路径下的内容），用于提供JVM自身需要的类。
- 并不继承自java.lang.ClassLoader，没有父加载器。
- 加载扩展类和应用程序类加载器，并制定为他们的父类加载器。
- 出于安全性考虑，Bootstrap启动类加载器只加载包名为java、javax、sun等开头的类。

### 扩展类加载器（Extension ClassLoader）

- Java语言编写，由sun.misc.Launcher$ExtClassLoader实现。
- 派生于ClassLoader类
- 父类加载器为引导类加载器
- 从java.ext.dirs系统属性所指定的目录中加载类库，或从JDK的安装目录的jre/lib/ext子目录（扩展目录）下加载类库。**如果用户创建的JAR放在此目录下，也会自动由扩展类加载器加载。**

### 系统类加载器（应用程序类加载器，AppClassLoader）

- Java语言编写，有sun.misc.Launcher$AppClassLoader实现
- 派生于ClassLoader类
- 父类加载器为扩展类加载器
- 它负责加载环境变量classpath或系统属性java.class.path指定路径下的类库
- 该类加载是程序中默认的类加载器，一般来说，Java应用的类都是由它来完成加载
- 通过ClassLoader#getSystemClassLoader()方法可以获取到该类加载器

```java
public static void main(String[] args) {
    System.out.println("-------引导类加载器-------");
    // 获取引导类加载器的加载类库路径，并且打印其要去加载的类库的url
    URL[] urLs = Launcher.getBootstrapClassPath().getURLs();
    // 循环打印
    for (URL url : urLs) {
		System.out.println(url.toExternalForm());
    }

	System.out.println("-------扩展类加载器-------");
    // 获取扩展类加载器的加载类库路径，并且打印
    String extDirs = System.getProperty("java.ext.dirs");
    // 循环打印，注意macOS/Linux下使用':'分隔，WinOs下使用';'分隔
    for (String s : extDirs.split(":")) {
		System.out.println(s);
    }
}
```

如果想要获取某个类的类加载器，就可以使用当前类的**xxx.class.getClassLoader()**方法来获取，比如想要获取String类的类加载器，就使用**String.class.getClassLoader()**，但因为String是在java.lang包下，而java.lang是在rt.jar中，所以String类的类加载器就是**null**(表示引导类加载器)。


