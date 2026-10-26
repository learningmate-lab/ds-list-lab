# -*- coding: utf-8 -*-
"""수업 실습 코드 (「쉽게 배우는 자료구조 with 파이썬」 실습 파일) — 실습 코드 구현 문제의 모범 답안·템플릿 원본

원본 파일에서 바꾼 점 (동작은 같음)
  · 탭 → 공백 4칸, 맨 위 import 줄 제거 (사이트에서는 필요한 클래스를 문제 코드에 함께 줌)
  · circularDoublyLinkedList.py: get()의 `i == -1::` 오타 → `i == -1:`, 들여쓰기가 1칸 어긋난 `def __iter__` 수정
  · postfix.py: 맨 앞 공백이 있던 `def evaluate` 수정, main() 제거 / reverseString.py: main() 제거
"""

# list/listNode.py  (코드 5-1)
LISTNODE = '''class ListNode:
    def __init__(self, newItem, nextNode:'ListNode'):
        self.item = newItem
        self.next = nextNode
'''

# list/linkedListBasic.py  (코드 5-15)
LLB = '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    # [알고리즘 5 - 2] 구현: 연결 리스트에 원소 삽입하기(더미 헤드를 두는 대표 버전)
    def insert(self, i:int, newItem):
        if i >= 0 and i <= self.__numItems:
            prev = self.__getNode(i - 1)
            newNode = ListNode(newItem, prev.next)
            prev.next = newNode
            self.__numItems += 1
        else:
            print("index", i, ": out of bound in insert()") # 필요 시 에러 처리

    def append(self, newItem):
        prev = self.__getNode(self.__numItems - 1)
        newNode = ListNode(newItem, prev.next)
        prev.next = newNode
        self.__numItems += 1

    # [알고리즘 5-3] 구현: 연결 리스트의 원소 삭제하기
    def pop(self, i:int):   # i번 노드 삭제. 고정 파라미터
        if (i >= 0 and i <= self.__numItems-1):
            prev = self.__getNode(i - 1)
            curr = prev.next
            prev.next = curr.next
            retItem = curr.item
            self.__numItems -= 1
            return retItem
        else:
            return None

    # [알고리즘 5 -4] 구현: 연결 리스트의 원소 x 삭제하기 (더미 헤드를 두는 대표 버전)
    def remove(self, x):
        (prev, curr) = self.__findNode(x)
        if curr != None:
            prev.next = curr.next
            self.__numItems -= 1
            return x
        else:
            return None

    # [알고리즘 5 - 5] 구현: 연결 리스트의 i번 원소 알려주기
    def get(self, i:int):
        if self.isEmpty():
            return None
        if (i >= 0 and i <= self.__numItems - 1):
            return self.__getNode(i).item
        else:
            return None

    # [알고리즘 5 -7] 구현: x가 연결 리스트의 몇 번 원소인지 알려주기
    def index(self, x) -> int:
        curr = self.__head.next  # 0번 노드:  더미 헤드 다음 노드
        for index in range(self.__numItems):
            if curr.item == x:
                return index
            else:
                curr = curr.next
        return -2 # 안 쓰는 인덱스

    # [알고리즘 5 -8] 구현: 기타 작업들
    def isEmpty(self) -> bool:
        return self.__numItems == 0

    def size(self) -> int:
        return self.__numItems

    def clear(self):
        self.__head = ListNode("dummy", None)
        self.__numItems = 0

    def count(self, x) -> int:
        cnt = 0
        curr = self.__head.next  # 0번 노드
        while curr != None:
            if curr.item == x:
                    cnt += 1
            curr = curr.next
        return cnt

    def extend(self, a): # 여기서 a는 self와 같은 타입의 리스트
        for index in range(a.size()):
            self.append(a.get(index))

    def copy(self):
        a = LinkedListBasic()
        for index in range(self.__numItems):
            a.append(self.get(index))
        return a

    def reverse(self):
        a = LinkedListBasic()
        for index in range(self.__numItems):
            a.insert(0, self.get(index))
        self.clear()
        for index in range(a.size()):
            self.append(a.get(index))

    def sort(self) -> None:
        a = []
        for index in range(self.__numItems):
            a.append(self.get(index))
        a.sort()
        self.clear()
        for index in range(len(a)):
            self.append(a[index])

    def __findNode(self, x) -> (ListNode, ListNode):
        prev = self.__head  # 더미 헤드
        curr = prev.next    # 0번 노드
        while curr != None:
            if curr.item == x:
                return (prev, curr)
            else:
                prev = curr; curr = curr.next
        return (None, None)

    # [알고리즘 5-6] 구현: 연결 리스트의 i번 노드 알려주기
    def __getNode(self, i:int) -> ListNode:
        curr = self.__head # 더미 헤드, index: -1
        for index in range(i+1):
            curr = curr.next
        return curr

    def printList(self):
        curr = self.__head.next # 0번 노드: 더미 헤드 다음 노드
        while curr != None:
            print(curr.item, end = ' ')
            curr = curr.next
        print()
'''

# list/circularLinkedList.py  (코드 5-22)
CLL = '''class CircularLinkedList:
    def __init__(self):
        self.__tail = ListNode("dummy", None)
        self.__tail.next = self.__tail
        self.__numItems = 0

    def insert(self, i:int, newItem) -> None:
        if (i >= 0 and i <= self.__numItems):
            prev = self.getNode(i - 1)
            newNode = ListNode(newItem, prev.next)
            prev.next = newNode
            if i == self.__numItems:
                self.__tail = newNode
            self.__numItems += 1
        else:
            print("index", i, ": out of bound in insert()") # 필요 시 에러 처리

    def append(self, newItem) -> None:
        newNode = ListNode(newItem, self.__tail.next)
        self.__tail.next = newNode
        self.__tail = newNode
        self.__numItems += 1

    def pop(self, *args):
        # 가변 파라미터. 인자가 없거나 -1이면 마지막 원소로 처리하기 위함. 파이썬 리스트 규칙 만족
        if self.isEmpty():
            return None
        # 인덱스 i 결정
        if len(args) != 0: # pop(k)과 같이 인자가 있으면 i = k 할당
            i = args[0]
        if len(args) == 0 or i == -1:# pop()에 인자가 없거나 pop(-1)이면 i에 맨 끝 인덱스 할당
            i = self.__numItems - 1
        # i번 원소 삭제
        if (i >= 0 and i <= self.__numItems - 1):
            prev = self.getNode(i - 1)
            retItem = prev.next.item
            prev.next = prev.next.next
            if i == self.__numItems - 1:
                self.__tail = prev
            self.__numItems -= 1
            return retItem
        else:
            return None

    def remove(self, x):
        (prev, curr) = self.__findNode(x)
        if curr != None:
            prev.next = curr.next
            if curr == self.__tail:
                self.__tail = prev
            self.__numItems -= 1
            return x
        else:
            return None

    def get(self, *args):
    # 가변 파라미터. 인자가 없거나 -1이면 마지막 원소로 처리하기 위함. 파이썬 리스트 규칙 만족
        if self.isEmpty():
            return None
        # 인덱스 i 결정
        if len(args) != 0: # pop(k)과 같이 인자가 있으면 i = k 할당
            i = args[0]
        if len(args) == 0 or i == -1:# pop()에 인자가 없거나 pop(-1)이면 i에 맨 끝 인덱스 할당
            i = self.__numItems - 1
        # i번 원소 리턴
        if (i >= 0 and i <= self.__numItems - 1):
            return self.getNode(i).item
        else:
            return None

    def index(self, x) -> int:
        cnt = 0
        for element in self:
            if element == x:
                return cnt
            cnt += 1
        return -12345

    def isEmpty(self) -> bool:
        return self.__numItems == 0

    def size(self) -> int:
        return self.__numItems

    def clear(self):
        self.__tail = ListNode("dummy", None)
        self.__tail.next = self.__tail
        self.__numItems = 0

    def count(self, x) -> int:
        cnt = 0
        for element in self:
            if element == x:
                    cnt += 1
        return cnt

    def extend(self, a): # a는 순회 가능한 모든 객체
        for x in a:
            self.append(x)

    def copy(self) -> b'CircularLinkedList':
        a = CircularLinkedList()
        for element in self:
            a.append(element)
        return a

    def reverse(self) -> None:
        __head = self.__tail.next  # 더미 헤드
        prev = __head; curr = prev.next; next = curr.next
        curr.next = __head; __head.next = self.__tail; self.__tail = curr
        for i in range(self.__numItems - 1):
            prev = curr; curr = next; next = next.next
            curr.next = prev

    def sort(self) -> None:
        a = []
        for element in self:
            a.append(element)
        a.sort()
        self.clear()
        for element in a:
            self.append(element)

    def __findNode(self, x) -> (ListNode, ListNode):
        __head = prev = self.__tail.next  # 더미 헤드
        curr = prev.next  # 0번 노드
        while curr != __head:
            if curr.item == x:
                return (prev, curr)
            else:
                prev = curr; curr = curr.next
        return (None, None)

    def getNode(self, i:int) -> ListNode:
        curr = self.__tail.next  # 더미 헤드, index: -1
        for index in range(i+1):
            curr = curr.next
        return curr

    def printList(self) -> None:
        for element in self:
            print(element, end = ' ')
        print()

    def __iter__(self):  # generating iterator and return
        return CircularLinkedListIterator(self)

class CircularLinkedListIterator:
    def __init__(self, alist):
        self.__head = alist.getNode(-1)  # 더미 헤드
        self.iterPosition = self.__head.next  # 0번 노드
    def __next__(self):
        if self.iterPosition == self.__head: # 순환 끝
            raise StopIteration
        else: # 현재 원소를 리턴하면서 다음 원소로 이동
            item = self.iterPosition.item
            self.iterPosition = self.iterPosition.next
            return item
'''

# list/bidirectNode.py  (코드 5-24)
BIDI = '''class BidirectNode:
    def __init__(self, x, prevNode:'BidirectNode', nextNode:'BidirectNode'):
        self.item = x
        self.prev = prevNode
        self.next = nextNode
'''

# list/circularDoublyLinkedList.py  (코드 5-25)
CDLL = '''class CircularDoublyLinkedList:
    def __init__(self):
        self.__head = BidirectNode("dummy", None, None)
        self.__head.prev = self.__head
        self.__head.next = self.__head
        self.__numItems = 0

    def insert(self, i:int, newItem) -> None:
        if (i >= 0 and i <= self.__numItems):
            prev = self.getNode(i - 1)
            newNode = BidirectNode(newItem, prev, prev.next)
            newNode.next.prev = newNode
            prev.next = newNode
            self.__numItems += 1
        else:
            print("index", i, ": out of bound in insert()") # 필요 시 에러 처리

    def append(self, newItem) -> None:
        prev = self.__head.prev
        newNode = BidirectNode(newItem, prev, self.__head)
        prev.next = newNode
        self.__head.prev = newNode
        self.__numItems += 1

    def pop(self, *args):
        # 가변 파라미터. 인자가 없거나 -1이면 마지막 원소로 처리하기 위함. 파이썬 리스트 규칙 만족
        if self.isEmpty():
            return None
        # 인덱스 i 결정
        if len(args) != 0: # pop(k)과 같이 인자가 있으면 i = k 할당
            i = args[0]
        if len(args) == 0 or i == -1:# pop()에 인자가 없거나 pop(-1)이면 i에 맨 끝 인덱스 할당
            i = self.__numItems - 1
        # i번 원소 삭제
        if (i >= 0 and i <= self.__numItems - 1):
            curr = self.getNode(i)
            retItem = curr.item
            curr.prev.next = curr.next
            curr.next.prev = curr.prev
            self.__numItems -= 1
            return retItem
        else:
            return None

    def remove(self, x):
        curr = self.__findNode(x)
        if curr != None:
            curr.prev.next = curr.next
            curr.next.prev = curr.prev
            self.__numItems -= 1
            return x
        else:
            return None

    def get(self, *args):
        # 가변 파라미터. 인자가 없거나 -1이면 마지막 원소로 처리하기 위함. 파이썬 리스트 규칙 만족
        if self.isEmpty(): return None
        # 인덱스 i 결정
        if len(args) != 0:   # pop(k)과 같이 인자가 있으면 i = k 할당
            i = args[0]
        if len(args) == 0 or i == -1:# pop()에 인자가 없거나 pop(-1)이면 i에 맨 끝 인덱스 할당
            i = self.__numItems - 1
        # i번 원소 리턴
        if (i >= 0 and i <= self.__numItems - 1):
            return self.getNode(i).item
        else:
            return None

    def index(self, x) -> int:
        cnt = 0
        for element in self:
            if element == x:
                return cnt
            cnt += 1
        return -12345

    def isEmpty(self) -> bool:
        return self.__numItems == 0

    def size(self) -> int:
        return self.__numItems

    def clear(self):
        self.__head = BidirectNode("dummy", None, None)
        self.__head.prev = self.__head
        self.__head.next = self.__head
        self.__numItems = 0

    def count(self, x) -> int:
        cnt = 0
        for element in self:
            if element == x:
                    cnt += 1
        return cnt

    def extend(self, a): # a는 순회 가능한 모든 객체
        for element in a:
            self.append(element)

    def copy(self) -> 'CircularDoublyLinkedList':
        a = CircularDoublyLinkedList()
        for element in self:
            a.append(element)
        return a

    def reverse(self) -> None:
        prev = self.__head; curr = prev.next; next = curr.next
        self.__head.next = prev.prev; self.__head.prev = curr
        for i in range(self.__numItems):
            curr.next = prev; curr.prev = next
            prev = curr; curr = next; next = next.next

    def sort(self) -> None:
        a = []
        for element in self:
            a.append(element)
        a.sort()
        self.clear()
        for element in a:
            self.append(element)

    def __findNode(self, x) -> BidirectNode:
        curr = self.__head.next  # 0번 노드
        while curr != self.__head:

            if curr.item == x:
                return curr
            else:
                curr = curr.next
        return None

    def getNode(self, i:int) -> BidirectNode:
        curr = self.__head  # 더미 헤드, index: -1
        for index in range(i + 1):
            curr = curr.next
        return curr

    def printList(self) -> None:
        for element in self:
            print(element, end = ' ')
        print()

    def __iter__(self):  # generating iterator and return
        return CircularDoublyLinkedListIterator(self)

class CircularDoublyLinkedListIterator:
    def __init__(self, alist):
        self.__head = alist.getNode(-1)         # 더미 헤드
        self.iterPosition = self.__head.next    # 0번 노드
    def __next__(self):
        if self.iterPosition == self.__head:    # 순환 끝
            raise StopIteration
        else: # 현재 원소를 리턴하면서 다음 원소로 이동
            item = self.iterPosition.item
            self.iterPosition = self.iterPosition.next
            return item
'''

# stack/listStack.py  (코드 6-6)
LISTSTACK = '''class ListStack:
    def __init__(self):
        self.__stack = []

    def push(self, x):
        self.__stack.append(x)

    def pop(self):
        return self.__stack.pop()

    def top(self):
        if self.isEmpty():
            return None
        else:
            return self.__stack[-1]

    def isEmpty(self) -> bool:
        return not bool(self.__stack)

    def popAll(self):
        self.__stack.clear()

    def printStack(self):
        print("Stack from top:", end = ' ')
        for i in range(len(self.__stack)-1, -1, -1):
            print(self.__stack[i], end = ' ')
        print()
'''

# stack/linkedStack.py  (코드 6-13)
LINKEDSTACK = '''class LinkedStack:
    def __init__(self):
        self.__list = LinkedListBasic()

    def push(self, newItem):
        self.__list.insert(0, newItem)

    def pop(self):
        return self.__list.pop(0)

    def top(self):
        if self.isEmpty():
            return None
        else:
            return self.__list.get(0)

    def isEmpty(self) -> bool:
        return self.__list.isEmpty()

    def popAll(self):
        self.__list.clear()

    def printStack(self):
        print("Stack from top:", end = '')
        for i in range(self.__list.size()):
            print(self.__list.get(i), end = '')
        print()
'''

# stack/postfix.py  (코드 6-16)
POSTFIX = '''def evaluate(p):
    s = ListStack()
    digitPreviously = False
    for i in range(len(p)):
        ch = p[i] #  i번 문자. 번호는 0번부터
        if ch.isdigit():    # ch가 숫자
            if digitPreviously:
                tmp = s.pop()
                tmp = 10 * tmp + (ord(ch) - ord('0'))
                s.push(tmp)
            else:
                s.push(ord(ch) - ord('0'))
                digitPreviously = True
        elif isOperator(ch): # ch가 연산자
            s.push(operation(s.pop(), s.pop(), ch))
            digitPreviously = False
        else:       # ch가 공백
            digitPreviously = False
    return s.pop()

def isOperator(ch) -> bool:  # 연산자인가?
    return (ch == '+' or ch == '-' or ch == '*' or ch == '/')

def operation(opr2:int, opr1:int, ch) -> int:  # 연산하기
        return {'+': opr1 + opr2, '-': opr1 - opr2, '*': opr1 * opr2, '/': opr1 // opr2}[ch]
'''

# stack/reverseString.py  (코드 6-15)
REVSTR = '''def reverse(str):
    st = ListStack()
    for i in range(len(str)):
        st.push(str[i])
    out = ""
    while not st.isEmpty():
        out += st.pop()
    return out
'''

CODE_NO = {'LISTNODE': '5-1', 'LLB': '5-15', 'CLL': '5-22', 'BIDI': '5-24', 'CDLL': '5-25', 'LISTSTACK': '6-6', 'LINKEDSTACK': '6-13', 'POSTFIX': '6-16', 'REVSTR': '6-15'}
