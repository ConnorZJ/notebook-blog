---
title: ArrayList
date: 2020-11-30
categories:
 - collection
tags:
 - collection
---

## ArrayList特性

- 底层使用数组来实现，所以查询效率高
- 实现了 RandomAccess接口，能支持快速访问



## ArrayList初始化

```java
private static final int DEFAULT_CAPACITY = 10;
```

默认容量为10

```java
private static final Object[] EMPTY_ELEMENTDATA = {};
```

空的Object数组，若用带指定容量的构造方法创建ArrayList实例时，传入容量为0的话，会使用这个空的数组

```java
transient Object[] elementData; // non-private to simplify nested class access
```

elementData为ArrayList实际存数据的数组

```java
private int size;
```

size为ArrayList中实际储存元素的个数

## ArrayList 构造方法

```java
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
```

使elementData元素为一个默认大小的Object数组，即一个空的Object数组

```java
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    }
}
```

参数为初始容量的构造方法

当指定容量大于0时，会让elementData初始化成一个指定容量大小的Object数组。当指定容量等于0时，elementData为空的Object数组。当指定容量小于0时，则会抛出非法参数异常

```java
public ArrayList(Collection<? extends E> c) {
    Object[] a = c.toArray();
    if ((size = a.length) != 0) {
        if (c.getClass() == ArrayList.class) {
            elementData = a;
        } else {
            elementData = Arrays.copyOf(a, size, Object[].class);
        }
    } else {
        // replace with empty array.
        elementData = EMPTY_ELEMENTDATA;
    }
}
```

参数为继承Collection集合的实例，能将实例中的所有元素拷贝到新的ArrayList实例中

先调用集合的``toArray()``方法，将元素转成Object数组。如果这个Object数组的长度为0，则使elementData为一个空的Object数组。如果这个数组长度大于0，当参数c的类型是ArrayList的话，就直接把数组拷贝给新的ArrayList实例，否则使用``Arrays.copyOf()``方法复制。

## ArrayList的重要方法

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
private void ensureCapacityInternal(int minCapacity) {
    ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
}
private static int calculateCapacity(Object[] elementData, int minCapacity) {
		if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
    	return Math.max(DEFAULT_CAPACITY, minCapacity);
  	}
  	return minCapacity;
}
private void ensureExplicitCapacity(int minCapacity) {
    modCount++;
    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
      grow(minCapacity);
}
```

当``add``一个元素的时候，会先走``ensureCapacityInternal``方法使容量+1，源码中注释了**increments modCount**，之后把elementData的第size+1个元素赋值为传入的元素，添加成功返回true

``calculateCapacity``方法会判断当前实例中elementData是否是一个空的Object数组，并返回DEFAULT_CAPACITY和minCapacity中较大的那一个。如果elementData不是一个空的数组，就返回需要的容量值。

``ensureExplicitCapacity``方法中，有个modCount++操作，这是将ArrayList的**操作记录数+1**，我认为是防止多线程的时候读与写一起并发，因为ArrayList是线程不安全的。

```java
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
      throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
      Integer.MAX_VALUE :
    MAX_ARRAY_SIZE;
}
```

grow方法是ArrayList中比较核心的方法，当ArrayList的大小不够用时，需要扩容，然后容纳更多的元素。

从grow方法的第二行可以看出，每次扩容都会计算出原来大小的1.5倍。如果这1.5倍太小的话，容量值就使用minCapacity。如果1.5倍非常大或者是传入的需要的容量非常大，则会得到hugeCapacity方法中的返回值。

在计算完了需要扩容的容量值之后，会使用Arrays.copyOf方法，就是说将原来的数组拷贝到一个新的数组中去。

hugeCapacity返回的是(minCapacity > MAX_ARRAY_SIZE) ? Integer.MAX_VALUE : MAX_ARRAY_SIZE;

```java
public int size() {
    return size;
}
public boolean isEmpty() {
    return size == 0;
}
```

这两个是获取ArrayList的元素个数和判断是否为空的方法。属性size为ArrayList中的elementData数组的长度。

```java
public int indexOf(Object o) {
    if (o == null) {
        for (int i = 0; i < size; i++)
            if (elementData[i]==null)
                return i;
    } else {
        for (int i = 0; i < size; i++)
            if (o.equals(elementData[i]))
                return i;
    }
    return -1;
}
public int lastIndexOf(Object o) {
    if (o == null) {
      for (int i = size-1; i >= 0; i--)
        if (elementData[i]==null)
          return i;
    } else {
      for (int i = size-1; i >= 0; i--)
        if (o.equals(elementData[i]))
          return i;
    }
    return -1;
}
public boolean contains(Object o) {
    return indexOf(o) >= 0;
}
```

indexOf方法就相当于数组中寻找元素索引下标的方法，只会返回第一次出现的下标。

lastIndexOf是和indexOf的遍历数组的方式反着来一次。

contains就调用了一次indexOf，存在索引值大于0的情况下，表示包含某个元素。

```java
public E get(int index) {
    rangeCheck(index);

  	return elementData(index);
}
private void rangeCheck(int index) {
    if (index >= size)
        throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
}
```

每次从ArrayList中获取元素的时候，都会先检查一次传入的索引是否会使数组产生下标越界，然后就返回elementData的下标的元素，所以ArrayList获取的效率是非常高的。

```java
public E remove(int index) {
    rangeCheck(index);

    modCount++;
    E oldValue = elementData(index);

    int numMoved = size - index - 1;
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index,
                         numMoved);
    elementData[--size] = null; // clear to let GC do its work

    return oldValue;
}
```

当我们调用 remove(int index) 时，首先会检查 index 是否合法，然后再判断要删除的元素是否位于数组的最后一个位置。如果 index 不是最后一个，就再次调用 System.arraycopy() 方法拷贝数组。说白了就是将从 index + 1 开始向后所有的元素都向前挪一个位置。然后将数组的最后一个位置空，size - 1。如果 index 是最后一个元素那么就直接将数组的最后一个位置空，size - 1即可。 