### HashMap 特性

- 一种键值对的数据接口
- 允许null的key和null的值，且null的key放在第一位
- 无序，且顺序会不定时改变，如果要有序的map集合，则使用**LinkedHashMap**
- 线程不安全，如果需要线程安全的话，就需要使用ConcurrentHashMap
- 底层采用数组+链表的方式实现，JDK8之后增加了红黑树

### HashMap初始化

```java
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
static final float DEFAULT_LOAD_FACTOR = 0.75f;
```

从以上几个final类型的变量的译意，可以看出，HashMap的默认初始化的大小是**2^4**，也就是**16**。因为底层是数组+链表+红黑树（1.8之后）实现的，所以，当往HashMap中put到一定值之后，HashMap的容量就会扩容。但是不是达到了16个元素之后才去扩容，是因为HashMap中有个负载因子，每次给HashMap分配空间大小的时候，都会根据负载因子和容量值去动态计算。具体如何扩容，请看下面负载因子的解释。

第二行的默认**负载因子**，意思是当HashMap的容量达到了**容量*负载因子**的大小后，HashMap就会扩容一次，以便于储存更多的数据。比如说，实例化一个无参的HashMap对象，默认容量是16，负载因子是0.75，那么这个HashMap对象中最多只能储存了16*0.75=12个数据，当要使用put操作增加一个数据的时候，HashMap就会扩容一次。如果制定了一个HashMap的指定大小，又想让这个HashMap能够使用空间最大化的话，就应该将负载因子设置得接近1就可以了。

### HashMap的4个构造方法

```java
public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}
```

当使用这个构造方法的时候，HashMap会使用默认的容量值16与默认的负载因子0.75

```java
public HashMap(int initialCapacity) {
    this(initialCapacity, DEFAULT_LOAD_FACTOR);
}
```

使用这个构造方法，能够指定HashMap的初始大小，同时调用初始容量和默认负载因子的两个参数的构造方法，使负载因子为0.75

```java
public HashMap(Map<? extends K, ? extends V> m) {
    this.loadFactor = DEFAULT_LOAD_FACTOR;
    putMapEntries(m, false);
}
```

这个构造方法，可以让继承了Map接口的数据结构转成HashMap的数据结构，``putMapEntries(m, false)``方法是将传入的Map中的数据拷贝至新的HashMap中，具体实现后面分析。

```java
public HashMap(int initialCapacity, float loadFactor) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal initial capacity: " +
                                           initialCapacity);
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal load factor: " +
                                           loadFactor);
    this.loadFactor = loadFactor;
    this.threshold = tableSizeFor(initialCapacity);
}
```

这个构造方法使用指定的容量和指定负载因子，当传入的容量小于0的时候，就会抛出一个异常。当传入的容量值大于最大容量的时候，就使用最大容量。HashMap中的最大容量是**2^30**。接着当负载因子小于零或者是NaN的时候（比如0/0就是NaN，表示未确定数），就会抛出异常。最后就是构造出一个HashMap的实例对象了。



### HashMap的重要方法

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

HashMap的最基础的方法就是hash方法了，初识这段代码的时候，我根本看不懂它到底在做什么:sweat_smile:，经过搜索之后，发现它是叫做**扰动函数**，将key的hashCode做一次16位的右移位异或混合。。。。。

好吧，我对其还是看不懂。但是含义是将key的值做散列化，返回一个散列的int型数值，之所以要采用这么复杂（对我而言）的算法，就是要尽可能的避免不同的key值得到的散列值相同，使散列值平均，尽可能的不产生的hash碰撞。以提高查询的时候的效率。

为什么散列值平均，不产生hash碰撞就能提高查询效率呢？是因为HashMap的底层是数组+链表+红黑树，先将所有的元素放在数组中，key产生的散列值就是该数组的下标，如果使用hash函数产生了两个相同的散列值，那么就会将将数组的该位置上的元素使用链表。如果每一个散列值都是不同的，那么相当于数组的每一个插槽都是只有一个元素。我们都知道，数组的查询复杂度是O(1)，所以说提高HashMap的查询效率，使散列值平均就是很重要的一个手段。



```java
final void putMapEntries(Map<? extends K, ? extends V> m, boolean evict) {
    int s = m.size();
    if (s > 0) {
        if (table == null) { // pre-size
            float ft = ((float)s / loadFactor) + 1.0F;
            int t = ((ft < (float)MAXIMUM_CAPACITY) ?
                     (int)ft : MAXIMUM_CAPACITY);
            if (t > threshold)
                threshold = tableSizeFor(t);
        }
        else if (s > threshold)
            resize();
        for (Map.Entry<? extends K, ? extends V> e : m.entrySet()) {
            K key = e.getKey();
            V value = e.getValue();
            putVal(hash(key), key, value, false, evict);
        }
    }
}
```

这个方法是在构造方法中会调用到的，将继承了Map接口的数据结构的对象中的值，拷贝到HashMap中去。

方法入参有两个，第一个是要拷贝的map来源。第二个是boolean型的值，表示是否是拷贝到空的HashMap中，如果是使用构造方法走这个拷贝方法的话，就为false，如果是使用实例的putAll方法走这个拷贝方法的话，就为true。

这个方法的内容主要是：先用map的大小除负载因子，这样就能算出应该要申请的内容大小是多少。ft的计算式子最后加上了一个1，是为了不让前面的除法还带有小数，向上取整。如果ft小于最大容量的话，就使用ft；如果大于最大容量的话，就使用最大容量。接下来判断如果t大于threshold的话，就进行一次扩容。



```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
  	// 判断table是否为null，为null的话，就初始化
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
  	// 通过hash值去获取到节点，如果节点为空，则新建一个节点
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
      	// 如果节点的类型是红黑树，则进行红黑树插入
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            for (int binCount = 0; ; ++binCount) {
              	// 如果p只是一个头结点，则新建一个节点
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                  	// 当链表的大小大于8的时候，将链表转换成红黑树
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
      	// 如果节点已经存在值，则覆盖
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
          	// 判断是否可以覆盖，并且value是否为空
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
          	// inkedHashMap后置操作
            afterNodeAccess(e);
            return oldValue;
        }
    }
  	// 更新大小
    ++modCount;
  	// 如果大小已经达到临界值，扩容
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

putVal方法是HashMap中最频繁使用的方法了，通过译意能知道这个方法是将传入的键值对给put到HashMap中。

方法解析已在上述代码中注释表明。



```java
final Node<K,V>[] resize() {
  	// 获取旧的table，及其他属性
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
      	// 如果旧的容量大于最大容量，则临界值等于Integer的最大值，并且结束扩容
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
      	// 否则扩容2倍
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
              	// 调整红黑树
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
              	// 调整链表
                else { // preserve order
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

