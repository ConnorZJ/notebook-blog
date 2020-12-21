---
title: 双亲委派机制
date: 2020-12-20
categories:
 - JVM
tags:
 - JVM
---

Java虚拟机对class文件采用的是**按需加载**的方式，也就是说当需要使用该类时，才会将他的class文件加载到内存中生成class对象。而且加载某个类的class文件时，Java虚拟机采用的是**双亲委派机制**，即把请求交由父类处理，它是一种任务委派模式。

## 双亲委派机制的工作原理

1. 如果一个类加载器收到了类加载的请求，它并不会自己先去加载，而是把这个请求委托给父类的加载器去加载。
2. 如果父类的加载器还存在其父类加载器的话，则进一步委托给其父类的类加载器，层层累加，依次递归，请求最终到达最上层的启动类加载器（Bootstrap ClassLoader）。
3. 如果父类加载器可以完成类的加载任务，就成功返回，倘若父类加载器无法完成家在任务，子加载器才会尝试自己去加载，这就是双亲委派模型。

### 代码解析

```java
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
    synchronized (getClassLoadingLock(name)) {
        // 首先，检查这个类是否已经被加载过了
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            long t0 = System.nanoTime();
            try {
                // 如果存在父类加载器，则由父类加载器去加载
                if (parent != null) {
                    c = parent.loadClass(name, false);
                } else {
                    // 不存在父类加载器，表示需要通过引导类加载器去加载
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // ClassNotFoundException thrown if class not found
                // from the non-null parent class loader
            }
			// 如果父类加载器加载失败了，则由自己去加载
            if (c == null) {
                // If still not found, then invoke findClass in order
                // to find the class.
                long t1 = System.nanoTime();
                // 由自己去加载
                c = findClass(name);

                // this is the defining class loader; record the stats
                sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                sun.misc.PerfCounter.getFindClasses().increment();
            }
        }
        if (resolve) {
            resolveClass(c);
        }
        return c;
    }
}
```

由该代码很容易就能看出，类的加载是先判断有没有存在该类，如果存在，则返回该类；不存在的话，就委托父类加载器去加载。如果父类加载器加载成功了，返回该类，否则由自己去加载。

## 双亲委派机制的优势

- 防止重复加载同一个类，当加载一个类的时候，会去寻找是否已经加载过该类了，层层递归，直到知道了父类都没有加载过的话，才去加载这个类。
- 保护程序安全，防止核心API不被篡改。