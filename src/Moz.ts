enum Moz {
  Nop,
  Fail,
  Alt,
  Succ,
  Jump,
  Call,
  Ret,
  Pos,
  Back,
  Skip,
  Byte,
  Any,
  Str,
  Set,
  NByte,
  NAny,
  NStr,
  NSet,
  OByte,
  OAny,
  OStr,
  OSet,
  RByte,
  RAny,
  RStr,
  RSet,
  Consume,
  First,
  Lookup,
  Memo,
  MemoFail,
  TPush,
  TPop,
  TLeftFold,
  TNew,
  TCapture,
  TTag,
  TReplace,
  TStart,
  TCommit,
  TAbort,
  TLookup,
  TMemo,
  SOpen,
  SClose,
  SMask,
  SDef,
  SIsDef,
  SExists,
  SMatch,
  SIs,
  SIsa,
  SDefNum,
  SCount,
  Exit,
  DFirst,
  Label,
}

class Expression {

}

class StackData {
  public ref;
  public value: number;
}

class MemoEntry {
  public failed: boolean;
  public consumed: number;
  public result;
  public stateValue: number = 0;
}

class MemoEntryKey extends MemoEntry {
  public key: number = -1;
}

class MemoTable {
  CountStored: number;
  CountUsed: number;
  CountInvalidated: number;

  constructor() {
    this.initStat();
  }

  initStat() {
    this.CountStored = 0;
    this.CountUsed = 0;
    this.CountInvalidated = 0;
  }

  setMemo(pos: number, memoPoint: number, failed: boolean, result, consumed: number, stateValue: number) {
    throw new Error("not implement setmemo");
  }

  getMemo(pos: number, memoPoint: number): MemoEntry {
    throw new Error("not implement getmemo");
  }

  getMemo2(pos: number, memoPoint: number, stateValue: number): MemoEntry {
    throw new Error("not implement getmemo2");
  }

}

class NullTable extends MemoTable {
  constructor() {
    super();
  }

  setMemo() {
    this.CountStored += 1;
  }

  getMemo() {
    return null;
  }

  getMemo2() {
    return null;
  }
}

class ElasticTable extends MemoTable {
  private memoArray: MemoEntryKey[];
  private size: number;
  private shift: number;

  constructor(n: number) {
    super();
    this.memoArray = [];
    this.size = 32 * n + 1;
    this.shift = (Math.log(n) / Math.log(2.0)) + 1;
    this.initStat();
  }

  longkey(pos: number, memoPoint: number, shift: number) {
    return ((pos << shift) | memoPoint);
  }

  setMemo(pos: number, memoPoint: number, failed: boolean, result, consumed: number, stateValue: number) {
    var key = this.longkey(pos, memoPoint, this.shift);
    var hash = key % this.size;
    var m = new MemoEntryKey();
    this.memoArray[hash] = m;
    m.key = key;
    m.failed = failed;
    m.result = result;
    m.consumed = consumed;
    m.stateValue = stateValue;
    this.CountStored += 1;
  }

  getMemo(pos: number, memoPoint: number) {
    var key = this.longkey(pos, memoPoint, this.shift);
    var hash = key % this.size;
    var m = this.memoArray[hash];
    if(m === undefined) {
      return null;
    }
    if(m.key === key) {
      this.CountUsed += 1;
      return m;
    }
    return null;
  }

  getMemo2(pos: number, memoPoint: number, stateValue: number) {
    var key = this.longkey(pos, memoPoint, this.shift);
    var hash = key % this.memoArray.length;
    var m = this.memoArray[hash];
    if(m === undefined) {
      return null;
    }
    if(m.key === key) {
      if(m.stateValue === stateValue) {
        this.CountUsed += 1;
        return m;
      }
      this.CountInvalidated += 1;
    }
    return null;
  }
}

class Symbol {
  static tagIdMap = [];
  static tagNameList = [];
  static tag(tagName: string): Symbol {
    var tag = Symbol.tagIdMap[tagName];
    if(tag == undefined) {
      tag = new Symbol(Symbol.tagNameList.length, tagName);
      Symbol.tagIdMap[tagName] = tag;
      Symbol.tagNameList.push(tag);
    }
    return tag;
  }
  constructor(public id: number, public tagName: string) {
  }
}

class Tree {
  tag: any;
  label: string[] = [];

  constructor(tag: Symbol, public pos, public value, val) {
    if(tag !== null) {
      this.tag = tag.tagName;
    }
  }

  toString(indent = ""): string {
    if(this.value === null) {
      return "";
    }
    var s = "";
    s += "#" + this.tag + "[";
    if(Array.isArray(this.value)) {
      s += "\n";
      var l = this.value.length;
      for(var i = 0; i < l; i++) {
        s += indent + "  " + `$${this.label[i]} ` + this.value[i].toString(indent + "  ") + "\n";
      }
      s += indent;
    } else {
      s += `'${this.value}'`;
    }
    s += "]";
    return s;
  }

  static NullTree = new Tree(null, null, null, null);

  newInstance(tag: Symbol, source: RuntimeContext, pos: number, epos: number, objectSize: number, value) {
    var position = {"start": pos, "end": epos};
    return new Tree(tag, position, source.slice(pos, epos), value);
  }

  link(label: Symbol, child: Tree) {
    if(label) {
      this.label.push(label.tagName);
    }
    if(!(this.value instanceof Array)) {
      this.value = [];
    }
    this.value.push(child);
  }
}

class ASTLog {
  id: number = 0;
  type: ASTM;
  label: Symbol;
  ref;
  value: number;

  next: ASTLog;

  toString() {
			switch (this.type) {
			case ASTM.Link:
				return "[" + this.id + "] link(index=" + this.value + ")";
			case ASTM.Capture:
				return "[" + this.id + "] cap(" + this.value + ")";
			case ASTM.Tag:
				return "[" + this.id + "] tag(" + this.ref.tagName + ")";
			case ASTM.Replace:
				return "[" + this.id + "] replace(" + this.ref + ")";
			case ASTM.LeftFold:
				return "[" + this.id + "] left(" + this.value + ")";
			case ASTM.New:
				return "[" + this.id + "] new(" + this.value + "," + this.ref + ")";
			case ASTM.Pop:
				return "[" + this.id + "] pop(" + this.ref + ")";
			case ASTM.Push:
				return "[" + this.id + "] push";
			}
			return "[" + this.id + "] nop";
		}
}

enum ASTM {
  Nop,
  Capture,
  Tag,
  Replace,
  LeftFold,
  Pop,
  Push,
  Link,
  New
}

class ASTMachine {
  baseTree: Tree;
  firstLog: ASTLog = null;
  lastAppendedLog: ASTLog = null;
  unusedDataLog: ASTLog = null;

  constructor(private source: RuntimeContext, baseTree: Tree) {
    this.baseTree = baseTree === null ? Tree.NullTree : baseTree;
    this.firstLog = new ASTLog();
    this.lastAppendedLog = this.firstLog;
  }

  log(type: ASTM, pos: number, label: Symbol, value) {
    var l: ASTLog;
    if(this.unusedDataLog == null) {
      l = new ASTLog();
    } else {
      l = this.unusedDataLog;
      this.unusedDataLog = l.next;
    }
    l.id = this.lastAppendedLog.id + 1;
    l.type = type;
    l.value = pos;
    l.label = label;
    l.ref = value;
    l.next = null;
    this.lastAppendedLog.next = l;
    this.lastAppendedLog = l;
  }

  logPush(): void {
    this.log(ASTM.Push, 0, null, null);
  }

  logPop(label: Symbol): void {
    this.log(ASTM.Pop, 0, label, null);
  }

  logLeftFold(pos: number, label: Symbol): void {
    this.log(ASTM.LeftFold, pos, label, null);
  }

  logNew(pos: number, debug): void {
    this.log(ASTM.New, pos, null, debug);
  }

  logCapture(pos: number): void {
    this.log(ASTM.Capture, pos, null, null);
  }

  logTag(tag: Symbol): void {
    this.log(ASTM.Tag, 0, null, tag);
  }

  logReplace(value): void {
    this.log(ASTM.Replace, 0, null, value);
  }

  saveTransactionPoint() {
    return this.lastAppendedLog;
  }

  latestLinkedNode;

  getLatestLinkedNode() {
    return this.latestLinkedNode;
  }

  logLink(label: Symbol, node): void {
    this.log(ASTM.Link, 0, label, node);
    this.latestLinkedNode = node;
  }

  rollTransactionPoint(point) {
    if(point != this.lastAppendedLog) {
      this.lastAppendedLog.next = this.unusedDataLog;
      this.unusedDataLog = point.next;
      point.next = null;
      this.lastAppendedLog = point;
    }
  }

  commitTransactionPoint(label: Symbol, point) {
    var node = this.createNode((<ASTLog>point).next, null);
    this.rollTransactionPoint(point);
    if(node != null) {
      this.logLink(label, node);
    }
  }

  createNode(start: ASTLog, pushed: ASTLog) {
    var cur: ASTLog = start;
    var spos: number = cur.value;
    var epos: number = spos;
    var tag: Symbol = null;
    var value = null;
    var objectSize: number = 0;
    for(cur = start; cur !== null; cur = cur.next) {
      switch(cur.type) {
        case ASTM.New:
  				spos = cur.value;
  				epos = spos;
  				objectSize = 0;
  				tag = null;
  				value = null;
  				start = cur;
		      break;
  			case ASTM.Capture:
  				epos = cur.value;
  				break;
  			case ASTM.Tag:
  				tag = cur.ref;
  				break;
  			case ASTM.Replace:
  				value = cur.ref;
  				break;
  			case ASTM.LeftFold:
  				cur.ref = this.constructLeft(start, cur, spos, epos, objectSize, tag, value);
  				cur.type = ASTM.Link;
  				spos = cur.value;
  				tag = null;
  				value = null;
  				objectSize = 1;
  				start = cur;
  				break;
  			case ASTM.Pop:
  				pushed.type = ASTM.Link;
  				pushed.label = cur.label;
  				pushed.ref = this.constructLeft(start, cur, spos, epos, objectSize, tag, value);
  				pushed.value = cur.value;
  				pushed.next = cur.next;
  				return pushed.ref;
  			case ASTM.Push:
  				this.createNode(cur.next, cur);
  			case ASTM.Link:
  				objectSize++;
  				break;
      }
    }
    return this.constructLeft(start, null, spos, epos, objectSize, tag, value);
  }

  _token: Symbol = Symbol.tag("token");
  _tree: Symbol = Symbol.tag("tree");

  constructLeft(start: ASTLog, end: ASTLog, spos: number, epos: number, objectSize: number, tag: Symbol, value) {
    if(tag == null) {
      tag = objectSize > 0 ? this._tree : this._token;
    }
    var newnode = this.baseTree.newInstance(tag, this.source, spos, epos, objectSize, value);
    if(objectSize > 0) {
      for(var cur = start; cur != end; cur = cur.next) {
        if(cur.ref instanceof Tree) {
          newnode.link(cur.label, cur.ref);
        }
      }
    }
    return newnode;
  }

  parseResult = null;

  getParseResult(): Tree {
    // for(var cur = this.firstLog; cur != null; cur = cur.next){
    //   console.log(cur.toString())
    // }
    for(var cur = this.firstLog; cur != null; cur = cur.next) {
      if(cur.type == ASTM.New) {
        this.parseResult = this.createNode(cur, null);
        break;
      }
    }
    if(this.parseResult == null) {
      this.parseResult = this.baseTree.newInstance(this._token, this.source, 0, 0, 0, null);
    }
    return this.parseResult;
  }

}

class SymbolTableEntry {
  stateValue: number;
  table: Symbol;
  code: number;
  symbol: string;
}

class SymbolTable {
  static NullSymbol = null;

  tables: SymbolTableEntry[] = [];
  tableSize: number = 0;
  maxTableSize: number = 0;
  _stateValue: number = 0;
  stateCount: number = 0;

  savePoint(): number {
    return this.tableSize;
  }

  get stateValue() {
    return this._stateValue;
  }

  set stateValue(s: number) {
    this._stateValue = s;
  }

  rollBack(savePoint: number): void {
    if(this.tableSize !== savePoint) {
      this.tableSize = savePoint;
      if(this.tableSize === 0) {
        this.stateValue = 0;
      } else {
        this.stateValue = this.tables[savePoint - 1].stateValue;
      }
    }
  }

  push(table: Symbol, code: number, str: string) {
    var entry =  new SymbolTableEntry();
    this.tables[this.tableSize] = entry;
    this.tableSize++;
    if(entry.table == table && entry.symbol === str) {
      entry.code = code;
      this.stateValue = entry.stateValue;
    } else {
      entry.table = table;
      entry.code = code;
      entry.symbol = str;
      this.stateCount += 1;
      this.stateValue = this.stateCount;
      entry.stateValue = this.stateCount;
    }
  }

  getSymbol(table: Symbol) {
    for(var i = this.tableSize - 1; i >= 0; i--) {
      var entry = this.tables[i];
      if(entry.table === table) {
        return entry.symbol;
      }
    }
    return null;
  }

  contains(table: Symbol, symbol: string) {
    var code = this.hash(symbol);
    for(var i = this.tableSize - 1; i >= 0; i--) {
      var entry = this.tables[i];
      if(entry.symbol === null) {
        return false;
      }
      if(entry.code === code && entry.symbol === symbol) {
        return true;
      }
    }
  }

  addSymbolMask(table: Symbol) {
    this.push(table, 0, SymbolTable.NullSymbol);
  }

  hash(str: string) {
    var hashcode = 1;
    for(var i = 0; i < str.length; i++) {
      hashcode = hashcode * 31 + (str.charCodeAt(i) & 0xff);
    }
    return hashcode;
  }

  addSymbol(table: Symbol, str: string) {
    this.push(table, this.hash(str), str);
  }

}

class RuntimeContext {
  private source: string;
  private _pos: number;
  private stacks: StackData[];
  private usedStackTop: number;
  private catchStackTop: number;
  private _astMachine: ASTMachine;
  private _symbolTable: SymbolTable;

  constructor(source: string, m: MemoTable) {
    this.source = source;
    this.init(m);
  }

  get pos() {
    return this._pos;
  }

  set pos(n: number) {
    this._pos = n;
  }

  get astMachine() {
    return this._astMachine;
  }

  set astMachine(m: ASTMachine) {
    this._astMachine = m;
  }

  get symbolTable() {
    return this._symbolTable;
  }

  set symbolTable(s: SymbolTable) {
    this._symbolTable = s;
  }

  slice(start: number, end: number) {
    return this.source.slice(start, end);
  }

  byteAt(pos: number): number {
    if(pos === this.source.length) {
      return 0;
    }
    var n = this.source.charCodeAt(pos);
    var n16 = n.toString(16);
    if(n16.length > 2) {
      var l = 1;
      if(n16.length > 3) {
        l = 2;
      }
      // console.log(this.source[this.pos])
      return parseInt(n16.slice(1, l) ,16);
    }
    return n;
  }

  match(pos: number, str: string): boolean {
    if(pos + str.length > this.source.length) {
      return false;
    }
    return this.source.substr(pos, str.length) === str;
  }

  consume(length: number): boolean {
    this.pos += length;
    return true;
  }

  hasUnconsumed(): boolean {
    return this.pos != this.source.length;
  }

  init(memoTable: MemoTable): void {
    this.astMachine = new ASTMachine(this, Tree.NullTree);
    this.symbolTable = new SymbolTable();
    this._pos = 0;
    this.stacks = [];
    this.stacks[0] = new StackData();
    this.stacks[0].ref = null;
    this.stacks[0].value = 0;
    this.stacks[1] = new StackData();
    this.stacks[1].ref = new Exit(false);
    this.stacks[1].value = this.pos;
    this.stacks[2] = new StackData();
    this.stacks[2].ref = this.astMachine.saveTransactionPoint();
    this.stacks[2].value = this.symbolTable.savePoint();
    this.stacks[3] = new StackData();
    this.stacks[3].ref = new Exit(true);
    this.stacks[3].value = 0;
    this.usedStackTop = 3;
    this.catchStackTop = 0;
    this.memoTable = memoTable;
  }

  rollback(pos: number): void {
    this.pos = pos;
  }

  fail(): Instruction {
    var s0 = this.stacks[this.catchStackTop];
    var s1 = this.stacks[this.catchStackTop + 1];
    var s2 = this.stacks[this.catchStackTop + 2];
    this.usedStackTop = this.catchStackTop - 1;
    this.catchStackTop = s0.value;
    if(s1.value < this.pos) {
      this.rollback(s1.value);
    }
    this.astMachine.rollTransactionPoint(s2.ref);
    this.symbolTable.rollBack(s2.value);
    return s1.ref;
  }

  skip(next: Instruction): Instruction {
    var s1: StackData = this.stacks[this.catchStackTop + 1];
    if(s1.value == this.pos) {
      return this.fail();
    }
    s1.value = this.pos;
    var s2: StackData = this.stacks[this.catchStackTop + 2];
    s2.ref = this.astMachine.saveTransactionPoint();
    s2.value = this.symbolTable.savePoint();
    return next;
  }

  newUnusedStack(): StackData {
    this.usedStackTop++;
    this.stacks[this.usedStackTop] = new StackData();
    return this.stacks[this.usedStackTop];
  }

  popStack():StackData {
    var s: StackData = this.stacks[this.usedStackTop];
    this.usedStackTop--;
    return s;
  }

  pushAlt(failjump: Instruction): void {
    var s0: StackData = this.newUnusedStack();
    var s1: StackData = this.newUnusedStack();
    var s2: StackData = this.newUnusedStack();
    s0.value = this.catchStackTop;
    this.catchStackTop = this.usedStackTop - 2;
    s1.ref = failjump;
    s1.value = this.pos;
    s2.ref = this.astMachine.saveTransactionPoint();
    s2.value = this.symbolTable.savePoint();
  }

  popAlt(): number {
    var s0: StackData = this.stacks[this.catchStackTop];
    var s1: StackData = this.stacks[this.catchStackTop + 1];
    var pos: number = s1.value;
    this.usedStackTop = this.catchStackTop - 1;
    this.catchStackTop = s0.value;
    return pos;
  }

  memoTable: MemoTable;

  setMemo(pos: number, memoId: number, failed: boolean, result, consumed: number, state: boolean): void {
    this.memoTable.setMemo(pos, memoId, failed, result, consumed, state? this.symbolTable.stateValue : 0);
  }

  getMemo(memoId: number, state: boolean): MemoEntry {
    return state? this.memoTable.getMemo2(this.pos, memoId, this.symbolTable.stateValue) : this.memoTable.getMemo(this.pos, memoId);
  }

}

class Instruction {
  id: number;

  constructor(public opcode: Moz, public e: Expression, public next: Instruction) {
  }

  toString() {
    return Moz[this.opcode];
  }

  isCrementedNext(): boolean {
    if(this.next !== undefined) {
      return this.next.id === this.id + 1;
    }
    return true;
  }

  exec(sc: RuntimeContext): Instruction {
    throw new Error("not implement exec");
  }
}

class MozInstruction extends Instruction {
  constructor(opcode: Moz, e: Expression, next: Instruction) {
    super(opcode, e, next);
  }
}

class Branch extends MozInstruction {
  public jump: Instruction;
  constructor(opcode: Moz, e: Expression, next: Instruction) {
    super(opcode, e, next);
  }
}

class BranchTable extends MozInstruction {
  public jumpTable: Instruction[];

  constructor(opcode: Moz, e: Expression, next: Instruction) {
    super(opcode, e, next);
  }
}

class Nop extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Nop, e, next);
  }

  exec(sc: RuntimeContext) {
    return null;
  }
}

class Fail extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Fail, e, next);
  }

  exec(sc: RuntimeContext) {
    return sc.fail();
  }
}

class Alt extends Branch {
  constructor(e: Expression, next: Instruction, jump: Instruction) {
    super(Moz.Alt, e, next);
    this.jump = jump;
  }

  exec(sc: RuntimeContext) {
    sc.pushAlt(this.jump);
    return this.next;
  }
}

class Succ extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Succ, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.popAlt();
    return this.next;
  }
}

class Jump extends Branch {
  constructor(e: Expression, next: Instruction, jump: Instruction) {
    super(Moz.Jump, e, next);
    this.jump = jump;
  }

  exec(sc: RuntimeContext) {
    return this.jump;
  }
}

class Call extends Branch {
  constructor(e: Expression, next: Instruction, jump: Instruction, private nonTerminal: string) {
    super(Moz.Call, e, next);
    this.jump = jump;
  }

  toString() {
    return super.toString() + " " + this.nonTerminal;
  }

  exec(sc: RuntimeContext) {
    var s: StackData = sc.newUnusedStack();
    s.ref = this.jump;
    return this.next;
  }
}

class Ret extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Ret, e, next);
  }

  exec(sc: RuntimeContext) {
    var s: StackData = sc.popStack();
    return s.ref;
  }
}

class Pos extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Pos, e, next);
  }

  exec(sc: RuntimeContext) {
    var s: StackData = sc.newUnusedStack();
    s.value = sc.pos;
    return this.next;
  }
}

class Back extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Back, e, next);
  }

  exec(sc: RuntimeContext) {
    var s: StackData = sc.popStack();
    sc.pos = s.value;
    return this.next;
  }
}

class Skip extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Skip, e, next);
  }

  exec(sc: RuntimeContext) {
    return sc.skip(this.next);
  }
}

class Byte extends MozInstruction {
  constructor(e: Expression, next: Instruction, private byteChar: number) {
    super(Moz.Byte, e, next);
  }

  toString() {
    return super.toString() + " " + String.fromCharCode(this.byteChar);
  }

  exec(sc: RuntimeContext) {
    if(sc.byteAt(sc.pos) === this.byteChar) {
      sc.consume(1);
      return this.next;
    }
    return sc.fail();
  }
}

class Any extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.Any, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.hasUnconsumed()) {
      sc.consume(1);
      return this.next;
    }
    return sc.fail();
  }
}

class Str extends MozInstruction {
  constructor(e: Expression, next: Instruction, private str: string) {
    super(Moz.Str, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.match(sc.pos, this.str)) {
      sc.consume(this.str.length);
      return this.next;
    }
    return sc.fail();
  }
}

class Set extends MozInstruction {
  constructor(e: Expression, next: Instruction, private bytemap: boolean[]) {
    super(Moz.Set, e, next);
  }

  exec(sc: RuntimeContext) {
    if(this.bytemap[sc.byteAt(sc.pos)]) {
      sc.consume(1);
      return this.next;
    }
    return sc.fail();
  }
}

class NByte extends MozInstruction {
  constructor(e: Expression, next: Instruction, private byteChar: number) {
    super(Moz.NByte, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.byteAt(sc.pos) !== this.byteChar) {
      return this.next;
    }
    return sc.fail();
  }
}

class NAny extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.NAny, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.hasUnconsumed()) {
      return sc.fail();
    }
    return this.next;
  }
}

class NStr extends MozInstruction {
  constructor(e: Expression, next: Instruction, private str: string) {
    super(Moz.NStr, e, next);
  }

  exec(sc: RuntimeContext) {
    if(!sc.match(sc.pos, this.str)) {
      return this.next;
    }
    return sc.fail();
  }
}

class NSet extends MozInstruction {
  constructor(e: Expression, next: Instruction, private bytemap: boolean[]) {
    super(Moz.NSet, e, next);
  }

  exec(sc: RuntimeContext) {
    if(!(this.bytemap[sc.byteAt(sc.pos)])) {
      return this.next;
    }
    return sc.fail();
  }
}

class OByte extends MozInstruction {
  constructor(e: Expression, next: Instruction, private byteChar: number) {
    super(Moz.OByte, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.byteAt(sc.pos) === this.byteChar) {
      sc.consume(1);
    }
    return this.next;
  }
}

class OAny extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.OAny, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.hasUnconsumed()) {
      sc.consume(1);
    }
    return this.next;
  }
}

class OStr extends MozInstruction {
  constructor(e: Expression, next: Instruction, private str: string) {
    super(Moz.OStr, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.match(sc.pos, this.str)) {
      sc.consume(this.str.length);
    }
    return this.next;
  }
}

class OSet extends MozInstruction {
  constructor(e: Expression, next: Instruction, private bytemap: boolean[]) {
    super(Moz.OSet, e, next);
  }

  exec(sc: RuntimeContext) {
    if(this.bytemap[sc.byteAt(sc.pos)]) {
      sc.consume(1);
    }
    return this.next;
  }
}

class RByte extends MozInstruction {
  constructor(e: Expression, next: Instruction, private byteChar: number) {
    super(Moz.RByte, e, next);
  }

  exec(sc: RuntimeContext) {
    while(sc.byteAt(sc.pos) === this.byteChar) {
      sc.consume(1);
    }
    return this.next;
  }
}

class RAny extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.RAny, e, next);
  }

  exec(sc: RuntimeContext) {
    while(sc.hasUnconsumed()) {
      sc.consume(1);
    }
    return this.next;
  }
}

class RStr extends MozInstruction {
  constructor(e: Expression, next: Instruction, private str: string) {
    super(Moz.RStr, e, next);
  }

  exec(sc: RuntimeContext) {
    while(sc.match(sc.pos, this.str)) {
      sc.consume(this.str.length);
    }
    return this.next;
  }
}

class RSet extends MozInstruction {
  constructor(e: Expression, next: Instruction, private bytemap: boolean[]) {
    super(Moz.RSet, e, next);
  }

  exec(sc: RuntimeContext) {
    while(this.bytemap[sc.byteAt(sc.pos)]) {
      sc.consume(1);
    }
    return this.next;
  }
}

class Consume extends MozInstruction {
  constructor(e: Expression, next: Instruction, private shift: number) {
    super(Moz.Consume, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.consume(this.shift);
    return this.next;
  }
}

class First extends BranchTable {
  constructor(e: Expression, next: Instruction, jumpTable: Instruction[]) {
    super(Moz.First, e, next);
    this.jumpTable = jumpTable;
  }

  exec(sc: RuntimeContext) {
    var ch = sc.byteAt(sc.pos);
    return this.jumpTable[ch].exec(sc);
  }
}

class Lookup extends Branch {
  private memoPoint: number;
  private state: boolean;

  constructor(e: Expression, next: Instruction, state: boolean, memoPoint: number, jump: Instruction) {
    super(Moz.Lookup, e, next);
    this.jump = jump;
    this.memoPoint = memoPoint;
    this.state = state;
  }

  exec(sc: RuntimeContext) {
    var entry = sc.getMemo(this.memoPoint, this.state);
    if(entry !== null) {
      if(entry.failed) {
        return sc.fail();
      }
      // if(entry.consumed > 5){
      //   console.log(`Inst: ${this.toString()} pos:${sc.pos}`)
      //   console.log(entry)
      // }
      sc.consume(entry.consumed);
      return this.jump;
    }
    return this.next;
  }
}

class Memo extends MozInstruction {
  constructor(e: Expression, next: Instruction, private state: boolean, private memoPoint: number) {
    super(Moz.Memo, e, next);
  }

  exec(sc: RuntimeContext) {
    var ppos = sc.popAlt();
    var length = sc.pos - ppos;
    sc.setMemo(ppos, this.memoPoint, false, null, length, this.state);
    return this.next;
  }
}

class MemoFail extends MozInstruction {
  constructor(e: Expression, next: Instruction, private state: boolean, private memoPoint: number) {
    super(Moz.MemoFail, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.setMemo(sc.pos, this.memoPoint, true, null, 0, this.state);
    return sc.fail();
  }
}

class TPush extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.TPush, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.astMachine.logPush();
    return this.next;
  }
}

class TPop extends MozInstruction {
  constructor(e: Expression, next: Instruction, private label: Symbol) {
    super(Moz.TPop, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.astMachine.logPop(this.label);
    return this.next;
  }
}

class TLeftFold extends MozInstruction {
  constructor(e: Expression, next: Instruction, private shift: number, private label: Symbol) {
    super(Moz.TLeftFold, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.astMachine.logLeftFold(sc.pos - (256 - this.shift) % 256, this.label);
    return this.next;
  }
}

class TNew extends MozInstruction {
  constructor(e: Expression, next: Instruction, private shift: number) {
    super(Moz.TNew, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.astMachine.logNew(sc.pos - (256 - this.shift) % 256, this.id);
    return this.next;
  }
}

class TCapture extends MozInstruction {
  constructor(e: Expression, next: Instruction, private shift: number) {
    super(Moz.TCapture, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.astMachine.logCapture(sc.pos - (256 - this.shift) % 256);
    return this.next;
  }
}

class TTag extends MozInstruction {
  constructor(e: Expression, next: Instruction, private tag: Symbol) {
    super(Moz.TTag, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.astMachine.logTag(this.tag);
    return this.next;
  }
}

class TReplace extends MozInstruction {
  constructor(e: Expression, next: Instruction, private str: string) {
    super(Moz.TReplace, e, next);
  }

  exec(sc: RuntimeContext) {
    sc.astMachine.logReplace(this.str);
    return this.next;
  }
}

class TStart extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.TStart, e, next);
  }

  exec(sc: RuntimeContext) {
    var s = sc.newUnusedStack();
    s.ref = sc.astMachine.saveTransactionPoint();
    return this.next;
  }
}

class TCommit extends MozInstruction {
  constructor(e: Expression, next: Instruction, private label: Symbol) {
    super(Moz.TCommit, e, next);
  }

  exec(sc: RuntimeContext) {
    var s = sc.popStack();
    sc.astMachine.commitTransactionPoint(this.label, s.ref);
    return this.next;
  }
}

class TAbort extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.TAbort, e, next);
  }

  exec(sc: RuntimeContext) {
    return this.next;
  }
}

class TLookup extends Branch {
  constructor(e: Expression, next: Instruction, private state: boolean, private memoPoint: number, jump: Instruction, private label: Symbol) {
    super(Moz.TLookup, e, next);
    this.jump = jump;
  }

  exec(sc: RuntimeContext) {
    var entry = sc.getMemo(this.memoPoint, this.state);
    if(entry != null) {
      if(entry.failed) {
        return sc.fail();
      }
      sc.consume(entry.consumed);
      sc.astMachine.logLink(this.label, entry.result);
      return this.jump;
    }
    return this.next;
  }

}

class TMemo extends MozInstruction {
  constructor(e: Expression, next: Instruction, private state: boolean, private memoPoint: number) {
    super(Moz.TMemo, e, next);
  }

  exec(sc: RuntimeContext) {
    var ppos = sc.popAlt();
    var length = sc.pos - ppos;
    sc.setMemo(ppos, this.memoPoint, false, sc.astMachine.getLatestLinkedNode(), length, this.state);
    return this.next;
  }
}

class SOpen extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.SOpen, e, next);
  }

  exec(sc: RuntimeContext) {
    var s: StackData = sc.newUnusedStack();
    s.value = sc.symbolTable.savePoint();
    return this.next;
  }
}

class SClose extends MozInstruction {
  constructor(e: Expression, next: Instruction) {
    super(Moz.SClose, e, next);
  }

  exec(sc: RuntimeContext) {
    var s: StackData = sc.popStack();
    sc.symbolTable.rollBack(s.value);
    return this.next;
  }
}

class SMask extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SMask, e, next);
  }

  exec(sc: RuntimeContext) {
    var s: StackData = sc.newUnusedStack();
    var st = sc.symbolTable;
    s.value = st.savePoint();
    st.addSymbolMask(this.table);
    return this.next;
  }
}

class SDef extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SDef, e, next);
  }

  exec(sc: RuntimeContext) {
    var top: StackData = sc.popStack();
    var captured = sc.slice(top.value, sc.pos);
    sc.symbolTable.addSymbol(this.table, captured);
    return this.next;
  }
}

class SIsDef extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol, private str: string) {
    super(Moz.SIsDef, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.symbolTable.contains(this.table, this.str)) {
      return this.next;
    }
    return sc.fail();
  }
}

class SExists extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SExists, e, next);
  }

  exec(sc: RuntimeContext) {
    if(sc.symbolTable.getSymbol(this.table) !== null) {
      return this.next;
    }
    return sc.fail();
  }
}

class SMatch extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SMatch, e, next);
  }

  exec(sc: RuntimeContext) {
    var t = sc.symbolTable.getSymbol(this.table);
    if(t === null) {
      return this.next;
    }
    if(sc.match(sc.pos, t)) {
      sc.consume(t.length);
      return this.next;
    }
    return sc.fail();
  }
}

class SIs extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SIs, e, next);
  }

  exec(sc: RuntimeContext) {
    var t = sc.symbolTable.getSymbol(this.table);
    if(t !== null) {
      var s = sc.popStack();
      var captured = sc.slice(s.value, sc.pos);
      if(t === captured) {
        return this.next;
      };
    }
    return sc.fail();
  }
}

class SIsa extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SIsa, e, next);
  }

  exec(sc: RuntimeContext) {
    var s = sc.popStack();
    var captured = sc.slice(s.value, sc.pos);
    if(sc.symbolTable.contains(this.table, captured)) {
      return this.next;
    }
    return sc.fail();
  }
}

class SDefNum extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SDefNum, e, next);
  }

  exec(sc: RuntimeContext) {
    return null;
  }
}

class SCount extends MozInstruction {
  constructor(e: Expression, next: Instruction, private table: Symbol) {
    super(Moz.SCount, e, next);
  }

  exec(sc: RuntimeContext) {
    return null;
  }
}

class Exit extends MozInstruction {
  constructor(private state: boolean) {
    super(Moz.Exit, null, null);
  }

  exec(sc: RuntimeContext) {
    var ast = sc.astMachine.getParseResult();
    // console.log(ast.toString());
    // console.log(JSON.stringify(ast, null, "  "));
    // throw new Error(`Exit state:${this.state}`);
    return null;
  }
}

class Label extends MozInstruction {
  get nonTerminal() {
    return this._nonTerminal;
  }
  constructor(e: Expression, next: Instruction, private _nonTerminal: string) {
    super(Moz.Label, e, next);
  }
  exec(sc: RuntimeContext) {
    // console.log(`Label: ${this.nonTerminal}`);
    return this.next;
  }
}

class Ref extends Instruction {
  constructor(id: number) {
    super(0, null, null);
    this.id = id;
  }

  exec() {
    return null;
  }
}

class MozLoader {
  codeList: Instruction[];
  buf: Buffer;
  pos: number;
  memoSize: number;
  instSize: number;
  poolNonTerminal: string[];
  poolBset: boolean[][];
  poolBstr: string[];
  poolTable: any[];
  poolTag: any[];

  constructor() {
    this.pos = 0;
  }

  read_u8(): number {
    return this.buf.readUIntBE(this.pos++, 1);
  }

  uread(): number {
    // console.log(`pos = ${this.pos}`);
    var n = this.buf[this.pos++];
    return n & 0xff;
  }

  read(num: number = 1): string {
    var s = "";
    s = this.buf.toString("utf-8", this.pos, this.pos + num);
    this.pos += num;
    return s;
  }

  read_u16(): number {
    var n = this.buf.readUInt16BE(this.pos);
    this.pos += 2;
    return n;
  }

  read_u24(): number {
    var n = this.read_u16();
    n = n << 8 | this.read_u8();
    return n;
  }

  read_u32(): number {
    var n = this.buf.readUInt32BE(this.pos);
    this.pos += 4;
    return n;
  }

  read_utf8(): string {
    var len = this.read_u16();
    var str = this.read(len);
    if(this.read_u8() !== 0) {
      throw new Error("moz format error");
    }
    return str;
  }

  read_b(): boolean {
    return this.uread() == 0 ? true : false;
  }

  read_bytemap(): boolean[] {
    var b: boolean[] = [];
    for(var i = 0; i < 256; i += 32) {
      this.read_bytemap_inner(b, i);
    }
    return b;
  }

  read_bytemap_inner(b: boolean[], offset: number): void {
    var u = this.read_u32();
    for(var i = 0; i < 32; i++) {
      var flag = 1 << i;
      if((u & flag) === flag) {
        b[offset + i] = true;
      }
    }
  }

  readByte() {
    return this.uread();
  }

  readBstr() {
    return this.poolBstr[this.read_u16()];
  }

  readBset() {
    return this.poolBset[this.read_u16()];
  }

  readTable() {
    var id = this.read_u16();
    return this.poolTable[id];
  }

  readShift() {
    return this.read_u8();
  }

  readJump(): Instruction {
    var id = this.read_u24();
    if(!(id < this.instSize)) {
      console.log(`r: ${id}`);
    }
    return new Ref(id);
  }

  readNonTerminal() {
    var id = this.read_u16();
    return this.poolNonTerminal[id];
  }

  readState() {
    return this.read_b();
  }

  readLabel(): Symbol {
    var id = this.read_u16();
    var l = this.poolTag[id];
    return (l == null) ? null : l;
  }

  readTag(): Symbol {
    var id = this.read_u16();
    return this.poolTag[id];
  }

  readMemoPoint() {
    return this.read_u32();
  }

  readJumpTable(): Instruction[] {
    var table = [];
    for(var i = 0; i < 257; i++) {
      table[i] = this.readJump();
    }
    return table;
  }

  loadCode(buf: Buffer, debug: boolean) {
    this.buf = buf;
    if(this.read() !== "N" || this.read() !== "E" || this.read() !== "Z") {
      throw new Error("non moz format");
    }
    var version = this.read();
    this.instSize = this.read_u16();
    this.memoSize = this.read_u16();
    var jumpTableSize = this.read_u16();
    var pool = this.read_u16();
    this.poolNonTerminal = [];
    for(var i = 0; i < pool; i++) {
      this.poolNonTerminal[i] = this.read_utf8();
      // console.log(this.poolNonTerminal[i]);
    }
    pool = this.read_u16();
    this.poolBset = [[]];
    for(var i = 0; i < pool; i++) {
      this.poolBset[i] = this.read_bytemap();
    }
    pool = this.read_u16();
    this.poolBstr = [];
    for(var i = 0; i < pool; i++) {
      this.poolBstr[i] = this.read_utf8();
    }
    pool = this.read_u16();
    this.poolTag = [];
    for(var i = 0; i < pool; i++) {
      this.poolTag[i] = Symbol.tag(this.read_utf8());
      // console.log(this.poolTag[i]);
    }
    pool = this.read_u16();
    this.poolTable = [];
    for(var i = 0; i < pool; i++) {
      this.poolTable[i] = Symbol.tag(this.read_utf8());
    }
    if(debug) {
      console.log("load moz File...");
      console.log(`Version: ${version}`);
      console.log(`InstructionSize: ${this.instSize}`);
      console.log(`MemoSize: ${this.memoSize}`);
      console.log(`JumpTableSize: ${jumpTableSize}`);
      console.log(`pos= ${this.pos}`);
    }
    this.codeList = [];
    for(var i = 0; i < this.instSize; i++) {
      this.loadInstruction();
    }
    if(this.pos !== this.buf.length) {
      throw new Error("moz format error");
    }
    for(var i = 0; i < this.instSize; i++) {
      var inst = this.codeList[i];
      inst.next = this.codeList[inst.next.id];
      if(inst instanceof Branch) {
        inst.jump = this.codeList[inst.jump.id];
      }
      if(inst instanceof BranchTable) {
        for(var j = 0; j < inst.jumpTable.length; j++) {
          inst.jumpTable[j] = this.codeList[inst.jumpTable[j].id];
        }
      }
      // if(inst instanceof Label) {
      //   console.log(inst.nonTerminal);
      // } else {
      //   console.log(`L${inst.id}  ${inst}`);
      //   if(!inst.isCrementedNext()) {
      //     console.log(`   jump L${inst.next.id}`);
      //   }
      // }
    }
    // console.log(this.codeList);
  }

  loadInstruction() {
    var opcode = this.uread();
    var jumpNext = ((opcode & 128) == 128);
    opcode = 0b1111111 & opcode;
    // console.log(`pos = ${this.pos} ${Moz[opcode]}`);
    var inst = this.newInstruction(opcode);
    inst.id = this.codeList.length;
    this.codeList.push(inst);
    if(jumpNext) {
      inst.next = this.readJump();
    } else {
      inst.next = new Ref(this.codeList.length);
    }
  }

  newInstruction(opcode: number): Instruction {
    var jump: Instruction;
    var nonTerminal: string;
    var byteChar: number;
    var utf8: string;
    var byteMap;
    var shift;
    var state: boolean;
    var tag, label: Symbol;
    var memoPoint;
    var jumpTable;
    var table;

    switch(opcode) {
      case Moz.Nop: {
  			return new Nop(null, null);
  		}
  		case Moz.Fail: {
  			return new Fail(null, null);
  		}
  		case Moz.Alt: {
  			jump = this.readJump();
  			return new Alt(null, null, jump);
  		}
  		case Moz.Succ: {
  			return new Succ(null, null);
  		}
  		case Moz.Jump: {
  			jump = this.readJump();
  			return new Jump(null, null, jump);
  		}
  		case Moz.Call: {
  			jump = this.readJump();
  			nonTerminal = this.readNonTerminal();
  			return new Call(null, null, jump, nonTerminal);
  		}
  		case Moz.Ret: {
  			return new Ret(null, null);
  		}
  		case Moz.Pos: {
  			return new Pos(null, null);
  		}
  		case Moz.Back: {
  			return new Back(null, null);
  		}
  		case Moz.Skip: {
  			return new Skip(null, null);
  		}
  		case Moz.Byte: {
  			byteChar = this.readByte();
  			return new Byte(null, null, byteChar);
  		}
  		case Moz.Any: {
  			return new Any(null, null);
  		}
  		case Moz.Str: {
  			utf8 = this.readBstr();
  			return new Str(null, null, utf8);
  		}
  		case Moz.Set: {
  			byteMap = this.readBset();
  			return new Set(null, null, byteMap);
  		}
  		case Moz.NByte: {
  			byteChar = this.readByte();
  			return new NByte(null, null, byteChar);
  		}
  		case Moz.NAny: {
  			return new NAny(null, null);
  		}
  		case Moz.NStr: {
  			utf8 = this.readBstr();
  			return new NStr(null, null, utf8);
  		}
  		case Moz.NSet: {
  			byteMap = this.readBset();
  			return new NSet(null, null, byteMap);
  		}
  		case Moz.OByte: {
  			byteChar = this.readByte();
  			return new OByte(null, null, byteChar);
  		}
  		case Moz.OAny: {
  			return new OAny(null, null);
  		}
  		case Moz.OStr: {
  			utf8 = this.readBstr();
  			return new OStr(null, null, utf8);
  		}
  		case Moz.OSet: {
  			byteMap = this.readBset();
  			return new OSet(null, null, byteMap);
  		}
  		case Moz.RByte: {
  			byteChar = this.readByte();
  			return new RByte(null, null, byteChar);
  		}
  		case Moz.RAny: {
  			return new RAny(null, null);
  		}
  		case Moz.RStr: {
  			utf8 = this.readBstr();
  			return new RStr(null, null, utf8);
  		}
  		case Moz.RSet: {
  			byteMap = this.readBset();
  			return new RSet(null, null, byteMap);
  		}
  		case Moz.Consume: {
  			shift = this.readShift();
  			return new Consume(null, null, shift);
  		}
		case Moz.First: {
			jumpTable = this.readJumpTable();
			return new First(null, null, jumpTable);
		}
  		case Moz.Lookup: {
  			state = this.readState();
  			memoPoint = this.readMemoPoint();
  			jump = this.readJump();
  			return new Lookup(null, null, state, memoPoint, jump);
  		}
  		case Moz.Memo: {
  			state = this.readState();
  			memoPoint = this.readMemoPoint();
  			return new Memo(null, null, state, memoPoint);
  		}
  		case Moz.MemoFail: {
  			state = this.readState();
  			memoPoint = this.readMemoPoint();
  			return new MemoFail(null, null, state, memoPoint);
  		}
  		case Moz.TPush: {
  			return new TPush(null, null);
  		}
  		case Moz.TPop: {
  			label = this.readLabel();
  			return new TPop(null, null, label);
  		}
  		case Moz.TLeftFold: {
  			shift = this.readShift();
  			label = this.readLabel();
  			return new TLeftFold(null, null, shift, label);
  		}
  		case Moz.TNew: {
  			shift = this.readShift();
  			return new TNew(null, null, shift);
  		}
  		case Moz.TCapture: {
  			shift = this.readShift();
  			return new TCapture(null, null, shift);
  		}
  		case Moz.TTag: {
  			tag = this.readTag();
  			return new TTag(null, null, tag);
  		}
  		case Moz.TReplace: {
  			utf8 = this.readBstr();
  			return new TReplace(null, null, utf8);
  		}
  		case Moz.TStart: {
  			return new TStart(null, null);
  		}
  		case Moz.TCommit: {
  			label = this.readLabel();
  			return new TCommit(null, null, label);
  		}
  		case Moz.TAbort: {
  			return new TAbort(null, null);
  		}
  		case Moz.TLookup: {
  			state = this.readState();
  			memoPoint = this.readMemoPoint();
  			jump = this.readJump();
  			label = this.readLabel();
  			return new TLookup(null, null, state, memoPoint, jump, label);
  		}
  		case Moz.TMemo: {
  			state = this.readState();
  			memoPoint = this.readMemoPoint();
  			return new TMemo(null, null, state, memoPoint);
  		}
  		case Moz.SOpen: {
  			return new SOpen(null, null);
  		}
  		case Moz.SClose: {
  			return new SClose(null, null);
  		}
  		case Moz.SMask: {
  			table = this.readTable();
  			return new SMask(null, null, table);
  		}
  		case Moz.SDef: {
  			table = this.readTable();
  			return new SDef(null, null, table);
  		}
  		case Moz.SIsDef: {
  			table = this.readTable();
  			utf8 = this.readBstr();
  			return new SIsDef(null, null, table, utf8);
  		}
  		case Moz.SExists: {
  			table = this.readTable();
  			return new SExists(null, null, table);
  		}
  		case Moz.SMatch: {
  			table = this.readTable();
  			return new SMatch(null, null, table);
  		}
  		case Moz.SIs: {
  			table = this.readTable();
  			return new SIs(null, null, table);
  		}
  		case Moz.SIsa: {
  			table = this.readTable();
  			return new SIsa(null, null, table);
  		}
  		case Moz.SDefNum: {
  			table = this.readTable();
  			return new SDefNum(null, null, table);
  		}
  		case Moz.SCount: {
  			table = this.readTable();
  			return new SCount(null, null, table);
  		}
  		case Moz.Exit: {
  			var state = this.readState();
  			return new Exit(state);
  		}
  	// 	case Moz.DFirst: {
  	// 		Instruction[] jumpTable = this.readJumpTable();
  	// 		return new DFirst(null, null, jumpTable);
  	// 	}
  		case 127:
  		case Moz.Label: {
  			nonTerminal = this.readNonTerminal();
  			return new Label(null, null, nonTerminal);
  		}
    }
  }

  showBuf() {
    console.log(this.buf.toJSON());
  }
}

class MozManager {
  init() {
    var fs = require("fs");
    if(this.config.repetition === undefined) {
      this.config.repetition = 1;
    }
    this.input = this.config.inputText;
    if(this.input === undefined) {
      this.input = fs.readFileSync(this.config.inputPath, "utf-8");
    }
    if(!this.config.mozInstruction) {
      this.mozCode = fs.readFileSync(this.config.mozPath);
      var ml = new MozLoader();
      this.config.debug = this.config.debug ? this.config.debug : false;
      ml.loadCode(this.mozCode, this.config.debug);
      this.config.mozInstruction = ml.codeList;
      this.config.memoSize = ml.memoSize;
    }
  }
  config;
  mozCode: Buffer;
  input: string;

  parse(config: {
    mozPath: string,
    mozInstruction?: Instruction[],
    memoSize?: number,
    inputPath?: string,
    inputText?: string,
    printAST?: boolean,
    debug?: boolean,
    repetition?: number,
  }) {
    this.config = config;
    this.init();
    var ast: Tree,
        start, end:number,
        sc: RuntimeContext,
        inst: Instruction;
    // console.log(config)

    // console.log(`length: ${this.input.length}`)
    for(var i = 0; i < this.config.repetition; i++) {
      sc = new RuntimeContext(this.input, new ElasticTable(this.config.memoSize));
      inst = this.config.mozInstruction[0];
      start = Date.now();
      while(inst !== null) {
        // console.log(`Inst: ${inst.toString()} pos:${sc.pos}`)
        inst = inst.exec(sc);
      }
      if(config.printAST) {
        ast = sc.astMachine.getParseResult();
        console.log(ast.toString());
        end = Date.now();
        console.log(`${end - start} ms`);
      }
      // console.log(`pos: ${sc.pos} len: ${this.input.length}`)
    }
  return sc.astMachine.getParseResult();
  }
}

module.exports = new MozManager();
