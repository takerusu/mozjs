var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Moz;
(function (Moz) {
    Moz[Moz["Nop"] = 0] = "Nop";
    Moz[Moz["Fail"] = 1] = "Fail";
    Moz[Moz["Alt"] = 2] = "Alt";
    Moz[Moz["Succ"] = 3] = "Succ";
    Moz[Moz["Jump"] = 4] = "Jump";
    Moz[Moz["Call"] = 5] = "Call";
    Moz[Moz["Ret"] = 6] = "Ret";
    Moz[Moz["Pos"] = 7] = "Pos";
    Moz[Moz["Back"] = 8] = "Back";
    Moz[Moz["Skip"] = 9] = "Skip";
    Moz[Moz["Byte"] = 10] = "Byte";
    Moz[Moz["Any"] = 11] = "Any";
    Moz[Moz["Str"] = 12] = "Str";
    Moz[Moz["Set"] = 13] = "Set";
    Moz[Moz["NByte"] = 14] = "NByte";
    Moz[Moz["NAny"] = 15] = "NAny";
    Moz[Moz["NStr"] = 16] = "NStr";
    Moz[Moz["NSet"] = 17] = "NSet";
    Moz[Moz["OByte"] = 18] = "OByte";
    Moz[Moz["OAny"] = 19] = "OAny";
    Moz[Moz["OStr"] = 20] = "OStr";
    Moz[Moz["OSet"] = 21] = "OSet";
    Moz[Moz["RByte"] = 22] = "RByte";
    Moz[Moz["RAny"] = 23] = "RAny";
    Moz[Moz["RStr"] = 24] = "RStr";
    Moz[Moz["RSet"] = 25] = "RSet";
    Moz[Moz["Consume"] = 26] = "Consume";
    Moz[Moz["First"] = 27] = "First";
    Moz[Moz["Lookup"] = 28] = "Lookup";
    Moz[Moz["Memo"] = 29] = "Memo";
    Moz[Moz["MemoFail"] = 30] = "MemoFail";
    Moz[Moz["TPush"] = 31] = "TPush";
    Moz[Moz["TPop"] = 32] = "TPop";
    Moz[Moz["TLeftFold"] = 33] = "TLeftFold";
    Moz[Moz["TNew"] = 34] = "TNew";
    Moz[Moz["TCapture"] = 35] = "TCapture";
    Moz[Moz["TTag"] = 36] = "TTag";
    Moz[Moz["TReplace"] = 37] = "TReplace";
    Moz[Moz["TStart"] = 38] = "TStart";
    Moz[Moz["TCommit"] = 39] = "TCommit";
    Moz[Moz["TAbort"] = 40] = "TAbort";
    Moz[Moz["TLookup"] = 41] = "TLookup";
    Moz[Moz["TMemo"] = 42] = "TMemo";
    Moz[Moz["SOpen"] = 43] = "SOpen";
    Moz[Moz["SClose"] = 44] = "SClose";
    Moz[Moz["SMask"] = 45] = "SMask";
    Moz[Moz["SDef"] = 46] = "SDef";
    Moz[Moz["SIsDef"] = 47] = "SIsDef";
    Moz[Moz["SExists"] = 48] = "SExists";
    Moz[Moz["SMatch"] = 49] = "SMatch";
    Moz[Moz["SIs"] = 50] = "SIs";
    Moz[Moz["SIsa"] = 51] = "SIsa";
    Moz[Moz["SDefNum"] = 52] = "SDefNum";
    Moz[Moz["SCount"] = 53] = "SCount";
    Moz[Moz["Exit"] = 54] = "Exit";
    Moz[Moz["DFirst"] = 55] = "DFirst";
    Moz[Moz["Label"] = 56] = "Label";
})(Moz || (Moz = {}));
var Expression = (function () {
    function Expression() {
    }
    return Expression;
})();
var StackData = (function () {
    function StackData() {
    }
    return StackData;
})();
var MemoEntry = (function () {
    function MemoEntry() {
        this.stateValue = 0;
    }
    return MemoEntry;
})();
var MemoEntryKey = (function (_super) {
    __extends(MemoEntryKey, _super);
    function MemoEntryKey() {
        _super.apply(this, arguments);
        this.key = -1;
    }
    return MemoEntryKey;
})(MemoEntry);
var MemoTable = (function () {
    function MemoTable() {
        this.initStat();
    }
    MemoTable.prototype.initStat = function () {
        this.CountStored = 0;
        this.CountUsed = 0;
        this.CountInvalidated = 0;
    };
    MemoTable.prototype.setMemo = function (pos, memoPoint, failed, result, consumed, stateValue) {
        throw new Error("not implement setmemo");
    };
    MemoTable.prototype.getMemo = function (pos, memoPoint) {
        throw new Error("not implement getmemo");
    };
    MemoTable.prototype.getMemo2 = function (pos, memoPoint, stateValue) {
        throw new Error("not implement getmemo2");
    };
    return MemoTable;
})();
var NullTable = (function (_super) {
    __extends(NullTable, _super);
    function NullTable() {
        _super.call(this);
    }
    NullTable.prototype.setMemo = function () {
        this.CountStored += 1;
    };
    NullTable.prototype.getMemo = function () {
        return null;
    };
    NullTable.prototype.getMemo2 = function () {
        return null;
    };
    return NullTable;
})(MemoTable);
var ElasticTable = (function (_super) {
    __extends(ElasticTable, _super);
    function ElasticTable(n) {
        _super.call(this);
        this.memoArray = [];
        this.size = 32 * n + 1;
        this.shift = (Math.log(n) / Math.log(2.0)) + 1;
        this.initStat();
    }
    ElasticTable.prototype.longkey = function (pos, memoPoint, shift) {
        return ((pos << shift) | memoPoint);
    };
    ElasticTable.prototype.setMemo = function (pos, memoPoint, failed, result, consumed, stateValue) {
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
    };
    ElasticTable.prototype.getMemo = function (pos, memoPoint) {
        var key = this.longkey(pos, memoPoint, this.shift);
        var hash = key % this.size;
        var m = this.memoArray[hash];
        if (m === undefined) {
            return null;
        }
        if (m.key === key) {
            this.CountUsed += 1;
            return m;
        }
        return null;
    };
    ElasticTable.prototype.getMemo2 = function (pos, memoPoint, stateValue) {
        var key = this.longkey(pos, memoPoint, this.shift);
        var hash = key % this.memoArray.length;
        var m = this.memoArray[hash];
        if (m === undefined) {
            return null;
        }
        if (m.key === key) {
            if (m.stateValue === stateValue) {
                this.CountUsed += 1;
                return m;
            }
            this.CountInvalidated += 1;
        }
        return null;
    };
    return ElasticTable;
})(MemoTable);
var Symbol = (function () {
    function Symbol(id, tagName) {
        this.id = id;
        this.tagName = tagName;
    }
    Symbol.tag = function (tagName) {
        var tag = Symbol.tagIdMap[tagName];
        if (tag == undefined) {
            tag = new Symbol(Symbol.tagNameList.length, tagName);
            Symbol.tagIdMap[tagName] = tag;
            Symbol.tagNameList.push(tag);
        }
        return tag;
    };
    Symbol.tagIdMap = [];
    Symbol.tagNameList = [];
    return Symbol;
})();
var Tree = (function () {
    function Tree(tag, pos, value, val) {
        this.pos = pos;
        this.value = value;
        this.label = [];
        if (tag !== null) {
            this.tag = tag.tagName;
        }
    }
    Tree.prototype.toString = function (indent) {
        if (indent === void 0) { indent = ""; }
        if (this.value === null) {
            return "";
        }
        var s = "";
        s += "#" + this.tag + "[";
        if (Array.isArray(this.value)) {
            s += "\n";
            var l = this.value.length;
            for (var i = 0; i < l; i++) {
                s += indent + "  " + ("$" + this.label[i] + " ") + this.value[i].toString(indent + "  ") + "\n";
            }
            s += indent;
        }
        else {
            s += "'" + this.value + "'";
        }
        s += "]";
        return s;
    };
    Tree.prototype.newInstance = function (tag, source, pos, epos, objectSize, value) {
        var position = { "start": pos, "end": epos };
        return new Tree(tag, position, source.slice(pos, epos), value);
    };
    Tree.prototype.link = function (label, child) {
        if (label) {
            this.label.push(label.tagName);
        }
        if (!(this.value instanceof Array)) {
            this.value = [];
        }
        this.value.push(child);
    };
    Tree.NullTree = new Tree(null, null, null, null);
    return Tree;
})();
var ASTLog = (function () {
    function ASTLog() {
        this.id = 0;
    }
    ASTLog.prototype.toString = function () {
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
    };
    return ASTLog;
})();
var ASTM;
(function (ASTM) {
    ASTM[ASTM["Nop"] = 0] = "Nop";
    ASTM[ASTM["Capture"] = 1] = "Capture";
    ASTM[ASTM["Tag"] = 2] = "Tag";
    ASTM[ASTM["Replace"] = 3] = "Replace";
    ASTM[ASTM["LeftFold"] = 4] = "LeftFold";
    ASTM[ASTM["Pop"] = 5] = "Pop";
    ASTM[ASTM["Push"] = 6] = "Push";
    ASTM[ASTM["Link"] = 7] = "Link";
    ASTM[ASTM["New"] = 8] = "New";
})(ASTM || (ASTM = {}));
var ASTMachine = (function () {
    function ASTMachine(source, baseTree) {
        this.source = source;
        this.firstLog = null;
        this.lastAppendedLog = null;
        this.unusedDataLog = null;
        this._token = Symbol.tag("token");
        this._tree = Symbol.tag("tree");
        this.parseResult = null;
        this.baseTree = baseTree === null ? Tree.NullTree : baseTree;
        this.firstLog = new ASTLog();
        this.lastAppendedLog = this.firstLog;
    }
    ASTMachine.prototype.log = function (type, pos, label, value) {
        var l;
        if (this.unusedDataLog == null) {
            l = new ASTLog();
        }
        else {
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
    };
    ASTMachine.prototype.logPush = function () {
        this.log(ASTM.Push, 0, null, null);
    };
    ASTMachine.prototype.logPop = function (label) {
        this.log(ASTM.Pop, 0, label, null);
    };
    ASTMachine.prototype.logLeftFold = function (pos, label) {
        this.log(ASTM.LeftFold, pos, label, null);
    };
    ASTMachine.prototype.logNew = function (pos, debug) {
        this.log(ASTM.New, pos, null, debug);
    };
    ASTMachine.prototype.logCapture = function (pos) {
        this.log(ASTM.Capture, pos, null, null);
    };
    ASTMachine.prototype.logTag = function (tag) {
        this.log(ASTM.Tag, 0, null, tag);
    };
    ASTMachine.prototype.logReplace = function (value) {
        this.log(ASTM.Replace, 0, null, value);
    };
    ASTMachine.prototype.saveTransactionPoint = function () {
        return this.lastAppendedLog;
    };
    ASTMachine.prototype.getLatestLinkedNode = function () {
        return this.latestLinkedNode;
    };
    ASTMachine.prototype.logLink = function (label, node) {
        this.log(ASTM.Link, 0, label, node);
        this.latestLinkedNode = node;
    };
    ASTMachine.prototype.rollTransactionPoint = function (point) {
        if (point != this.lastAppendedLog) {
            this.lastAppendedLog.next = this.unusedDataLog;
            this.unusedDataLog = point.next;
            point.next = null;
            this.lastAppendedLog = point;
        }
    };
    ASTMachine.prototype.commitTransactionPoint = function (label, point) {
        var node = this.createNode(point.next, null);
        this.rollTransactionPoint(point);
        if (node != null) {
            this.logLink(label, node);
        }
    };
    ASTMachine.prototype.createNode = function (start, pushed) {
        var cur = start;
        var spos = cur.value;
        var epos = spos;
        var tag = null;
        var value = null;
        var objectSize = 0;
        for (cur = start; cur !== null; cur = cur.next) {
            switch (cur.type) {
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
    };
    ASTMachine.prototype.constructLeft = function (start, end, spos, epos, objectSize, tag, value) {
        if (tag == null) {
            tag = objectSize > 0 ? this._tree : this._token;
        }
        var newnode = this.baseTree.newInstance(tag, this.source, spos, epos, objectSize, value);
        if (objectSize > 0) {
            for (var cur = start; cur != end; cur = cur.next) {
                if (cur.ref instanceof Tree) {
                    newnode.link(cur.label, cur.ref);
                }
            }
        }
        return newnode;
    };
    ASTMachine.prototype.getParseResult = function () {
        for (var cur = this.firstLog; cur != null; cur = cur.next) {
            if (cur.type == ASTM.New) {
                this.parseResult = this.createNode(cur, null);
                break;
            }
        }
        if (this.parseResult == null) {
            this.parseResult = this.baseTree.newInstance(this._token, this.source, 0, 0, 0, null);
        }
        return this.parseResult;
    };
    return ASTMachine;
})();
var SymbolTableEntry = (function () {
    function SymbolTableEntry() {
    }
    return SymbolTableEntry;
})();
var SymbolTable = (function () {
    function SymbolTable() {
        this.tables = [];
        this.tableSize = 0;
        this.maxTableSize = 0;
        this._stateValue = 0;
        this.stateCount = 0;
    }
    SymbolTable.prototype.savePoint = function () {
        return this.tableSize;
    };
    Object.defineProperty(SymbolTable.prototype, "stateValue", {
        get: function () {
            return this._stateValue;
        },
        set: function (s) {
            this._stateValue = s;
        },
        enumerable: true,
        configurable: true
    });
    SymbolTable.prototype.rollBack = function (savePoint) {
        if (this.tableSize !== savePoint) {
            this.tableSize = savePoint;
            if (this.tableSize === 0) {
                this.stateValue = 0;
            }
            else {
                this.stateValue = this.tables[savePoint - 1].stateValue;
            }
        }
    };
    SymbolTable.prototype.push = function (table, code, str) {
        var entry = new SymbolTableEntry();
        this.tables[this.tableSize] = entry;
        this.tableSize++;
        if (entry.table == table && entry.symbol === str) {
            entry.code = code;
            this.stateValue = entry.stateValue;
        }
        else {
            entry.table = table;
            entry.code = code;
            entry.symbol = str;
            this.stateCount += 1;
            this.stateValue = this.stateCount;
            entry.stateValue = this.stateCount;
        }
    };
    SymbolTable.prototype.getSymbol = function (table) {
        for (var i = this.tableSize - 1; i >= 0; i--) {
            var entry = this.tables[i];
            if (entry.table === table) {
                return entry.symbol;
            }
        }
        return null;
    };
    SymbolTable.prototype.contains = function (table, symbol) {
        var code = this.hash(symbol);
        for (var i = this.tableSize - 1; i >= 0; i--) {
            var entry = this.tables[i];
            if (entry.symbol === null) {
                return false;
            }
            if (entry.code === code && entry.symbol === symbol) {
                return true;
            }
        }
    };
    SymbolTable.prototype.addSymbolMask = function (table) {
        this.push(table, 0, SymbolTable.NullSymbol);
    };
    SymbolTable.prototype.hash = function (str) {
        var hashcode = 1;
        for (var i = 0; i < str.length; i++) {
            hashcode = hashcode * 31 + (str.charCodeAt(i) & 0xff);
        }
        return hashcode;
    };
    SymbolTable.prototype.addSymbol = function (table, str) {
        this.push(table, this.hash(str), str);
    };
    SymbolTable.NullSymbol = null;
    return SymbolTable;
})();
var RuntimeContext = (function () {
    function RuntimeContext(source, m) {
        this.source = source;
        this.init(m);
    }
    Object.defineProperty(RuntimeContext.prototype, "pos", {
        get: function () {
            return this._pos;
        },
        set: function (n) {
            this._pos = n;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RuntimeContext.prototype, "astMachine", {
        get: function () {
            return this._astMachine;
        },
        set: function (m) {
            this._astMachine = m;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RuntimeContext.prototype, "symbolTable", {
        get: function () {
            return this._symbolTable;
        },
        set: function (s) {
            this._symbolTable = s;
        },
        enumerable: true,
        configurable: true
    });
    RuntimeContext.prototype.slice = function (start, end) {
        return this.source.slice(start, end);
    };
    RuntimeContext.prototype.byteAt = function (pos) {
        if (pos === this.source.length) {
            return 0;
        }
        var n = this.source.charCodeAt(pos);
        var n16 = n.toString(16);
        if (n16.length > 2) {
            var l = 1;
            if (n16.length > 3) {
                l = 2;
            }
            return parseInt(n16.slice(1, l), 16);
        }
        return n;
    };
    RuntimeContext.prototype.match = function (pos, str) {
        if (pos + str.length > this.source.length) {
            return false;
        }
        return this.source.substr(pos, str.length) === str;
    };
    RuntimeContext.prototype.consume = function (length) {
        this.pos += length;
        return true;
    };
    RuntimeContext.prototype.hasUnconsumed = function () {
        return this.pos != this.source.length;
    };
    RuntimeContext.prototype.init = function (memoTable) {
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
    };
    RuntimeContext.prototype.rollback = function (pos) {
        this.pos = pos;
    };
    RuntimeContext.prototype.fail = function () {
        var s0 = this.stacks[this.catchStackTop];
        var s1 = this.stacks[this.catchStackTop + 1];
        var s2 = this.stacks[this.catchStackTop + 2];
        this.usedStackTop = this.catchStackTop - 1;
        this.catchStackTop = s0.value;
        if (s1.value < this.pos) {
            this.rollback(s1.value);
        }
        this.astMachine.rollTransactionPoint(s2.ref);
        this.symbolTable.rollBack(s2.value);
        return s1.ref;
    };
    RuntimeContext.prototype.skip = function (next) {
        var s1 = this.stacks[this.catchStackTop + 1];
        if (s1.value == this.pos) {
            return this.fail();
        }
        s1.value = this.pos;
        var s2 = this.stacks[this.catchStackTop + 2];
        s2.ref = this.astMachine.saveTransactionPoint();
        s2.value = this.symbolTable.savePoint();
        return next;
    };
    RuntimeContext.prototype.newUnusedStack = function () {
        this.usedStackTop++;
        this.stacks[this.usedStackTop] = new StackData();
        return this.stacks[this.usedStackTop];
    };
    RuntimeContext.prototype.popStack = function () {
        var s = this.stacks[this.usedStackTop];
        this.usedStackTop--;
        return s;
    };
    RuntimeContext.prototype.pushAlt = function (failjump) {
        var s0 = this.newUnusedStack();
        var s1 = this.newUnusedStack();
        var s2 = this.newUnusedStack();
        s0.value = this.catchStackTop;
        this.catchStackTop = this.usedStackTop - 2;
        s1.ref = failjump;
        s1.value = this.pos;
        s2.ref = this.astMachine.saveTransactionPoint();
        s2.value = this.symbolTable.savePoint();
    };
    RuntimeContext.prototype.popAlt = function () {
        var s0 = this.stacks[this.catchStackTop];
        var s1 = this.stacks[this.catchStackTop + 1];
        var pos = s1.value;
        this.usedStackTop = this.catchStackTop - 1;
        this.catchStackTop = s0.value;
        return pos;
    };
    RuntimeContext.prototype.setMemo = function (pos, memoId, failed, result, consumed, state) {
        this.memoTable.setMemo(pos, memoId, failed, result, consumed, state ? this.symbolTable.stateValue : 0);
    };
    RuntimeContext.prototype.getMemo = function (memoId, state) {
        return state ? this.memoTable.getMemo2(this.pos, memoId, this.symbolTable.stateValue) : this.memoTable.getMemo(this.pos, memoId);
    };
    return RuntimeContext;
})();
var Instruction = (function () {
    function Instruction(opcode, e, next) {
        this.opcode = opcode;
        this.e = e;
        this.next = next;
    }
    Instruction.prototype.toString = function () {
        return Moz[this.opcode];
    };
    Instruction.prototype.isCrementedNext = function () {
        if (this.next !== undefined) {
            return this.next.id === this.id + 1;
        }
        return true;
    };
    Instruction.prototype.exec = function (sc) {
        throw new Error("not implement exec");
    };
    return Instruction;
})();
var MozInstruction = (function (_super) {
    __extends(MozInstruction, _super);
    function MozInstruction(opcode, e, next) {
        _super.call(this, opcode, e, next);
    }
    return MozInstruction;
})(Instruction);
var Branch = (function (_super) {
    __extends(Branch, _super);
    function Branch(opcode, e, next) {
        _super.call(this, opcode, e, next);
    }
    return Branch;
})(MozInstruction);
var BranchTable = (function (_super) {
    __extends(BranchTable, _super);
    function BranchTable(opcode, e, next) {
        _super.call(this, opcode, e, next);
    }
    return BranchTable;
})(MozInstruction);
var Nop = (function (_super) {
    __extends(Nop, _super);
    function Nop(e, next) {
        _super.call(this, Moz.Nop, e, next);
    }
    Nop.prototype.exec = function (sc) {
        return null;
    };
    return Nop;
})(MozInstruction);
var Fail = (function (_super) {
    __extends(Fail, _super);
    function Fail(e, next) {
        _super.call(this, Moz.Fail, e, next);
    }
    Fail.prototype.exec = function (sc) {
        return sc.fail();
    };
    return Fail;
})(MozInstruction);
var Alt = (function (_super) {
    __extends(Alt, _super);
    function Alt(e, next, jump) {
        _super.call(this, Moz.Alt, e, next);
        this.jump = jump;
    }
    Alt.prototype.exec = function (sc) {
        sc.pushAlt(this.jump);
        return this.next;
    };
    return Alt;
})(Branch);
var Succ = (function (_super) {
    __extends(Succ, _super);
    function Succ(e, next) {
        _super.call(this, Moz.Succ, e, next);
    }
    Succ.prototype.exec = function (sc) {
        sc.popAlt();
        return this.next;
    };
    return Succ;
})(MozInstruction);
var Jump = (function (_super) {
    __extends(Jump, _super);
    function Jump(e, next, jump) {
        _super.call(this, Moz.Jump, e, next);
        this.jump = jump;
    }
    Jump.prototype.exec = function (sc) {
        return this.jump;
    };
    return Jump;
})(Branch);
var Call = (function (_super) {
    __extends(Call, _super);
    function Call(e, next, jump, nonTerminal) {
        _super.call(this, Moz.Call, e, next);
        this.nonTerminal = nonTerminal;
        this.jump = jump;
    }
    Call.prototype.toString = function () {
        return _super.prototype.toString.call(this) + " " + this.nonTerminal;
    };
    Call.prototype.exec = function (sc) {
        var s = sc.newUnusedStack();
        s.ref = this.jump;
        return this.next;
    };
    return Call;
})(Branch);
var Ret = (function (_super) {
    __extends(Ret, _super);
    function Ret(e, next) {
        _super.call(this, Moz.Ret, e, next);
    }
    Ret.prototype.exec = function (sc) {
        var s = sc.popStack();
        return s.ref;
    };
    return Ret;
})(MozInstruction);
var Pos = (function (_super) {
    __extends(Pos, _super);
    function Pos(e, next) {
        _super.call(this, Moz.Pos, e, next);
    }
    Pos.prototype.exec = function (sc) {
        var s = sc.newUnusedStack();
        s.value = sc.pos;
        return this.next;
    };
    return Pos;
})(MozInstruction);
var Back = (function (_super) {
    __extends(Back, _super);
    function Back(e, next) {
        _super.call(this, Moz.Back, e, next);
    }
    Back.prototype.exec = function (sc) {
        var s = sc.popStack();
        sc.pos = s.value;
        return this.next;
    };
    return Back;
})(MozInstruction);
var Skip = (function (_super) {
    __extends(Skip, _super);
    function Skip(e, next) {
        _super.call(this, Moz.Skip, e, next);
    }
    Skip.prototype.exec = function (sc) {
        return sc.skip(this.next);
    };
    return Skip;
})(MozInstruction);
var Byte = (function (_super) {
    __extends(Byte, _super);
    function Byte(e, next, byteChar) {
        _super.call(this, Moz.Byte, e, next);
        this.byteChar = byteChar;
    }
    Byte.prototype.toString = function () {
        return _super.prototype.toString.call(this) + " " + String.fromCharCode(this.byteChar);
    };
    Byte.prototype.exec = function (sc) {
        if (sc.byteAt(sc.pos) === this.byteChar) {
            sc.consume(1);
            return this.next;
        }
        return sc.fail();
    };
    return Byte;
})(MozInstruction);
var Any = (function (_super) {
    __extends(Any, _super);
    function Any(e, next) {
        _super.call(this, Moz.Any, e, next);
    }
    Any.prototype.exec = function (sc) {
        if (sc.hasUnconsumed()) {
            sc.consume(1);
            return this.next;
        }
        return sc.fail();
    };
    return Any;
})(MozInstruction);
var Str = (function (_super) {
    __extends(Str, _super);
    function Str(e, next, str) {
        _super.call(this, Moz.Str, e, next);
        this.str = str;
    }
    Str.prototype.exec = function (sc) {
        if (sc.match(sc.pos, this.str)) {
            sc.consume(this.str.length);
            return this.next;
        }
        return sc.fail();
    };
    return Str;
})(MozInstruction);
var Set = (function (_super) {
    __extends(Set, _super);
    function Set(e, next, bytemap) {
        _super.call(this, Moz.Set, e, next);
        this.bytemap = bytemap;
    }
    Set.prototype.exec = function (sc) {
        if (this.bytemap[sc.byteAt(sc.pos)]) {
            sc.consume(1);
            return this.next;
        }
        return sc.fail();
    };
    return Set;
})(MozInstruction);
var NByte = (function (_super) {
    __extends(NByte, _super);
    function NByte(e, next, byteChar) {
        _super.call(this, Moz.NByte, e, next);
        this.byteChar = byteChar;
    }
    NByte.prototype.exec = function (sc) {
        if (sc.byteAt(sc.pos) !== this.byteChar) {
            return this.next;
        }
        return sc.fail();
    };
    return NByte;
})(MozInstruction);
var NAny = (function (_super) {
    __extends(NAny, _super);
    function NAny(e, next) {
        _super.call(this, Moz.NAny, e, next);
    }
    NAny.prototype.exec = function (sc) {
        if (sc.hasUnconsumed()) {
            return sc.fail();
        }
        return this.next;
    };
    return NAny;
})(MozInstruction);
var NStr = (function (_super) {
    __extends(NStr, _super);
    function NStr(e, next, str) {
        _super.call(this, Moz.NStr, e, next);
        this.str = str;
    }
    NStr.prototype.exec = function (sc) {
        if (!sc.match(sc.pos, this.str)) {
            return this.next;
        }
        return sc.fail();
    };
    return NStr;
})(MozInstruction);
var NSet = (function (_super) {
    __extends(NSet, _super);
    function NSet(e, next, bytemap) {
        _super.call(this, Moz.NSet, e, next);
        this.bytemap = bytemap;
    }
    NSet.prototype.exec = function (sc) {
        if (!(this.bytemap[sc.byteAt(sc.pos)])) {
            return this.next;
        }
        return sc.fail();
    };
    return NSet;
})(MozInstruction);
var OByte = (function (_super) {
    __extends(OByte, _super);
    function OByte(e, next, byteChar) {
        _super.call(this, Moz.OByte, e, next);
        this.byteChar = byteChar;
    }
    OByte.prototype.exec = function (sc) {
        if (sc.byteAt(sc.pos) === this.byteChar) {
            sc.consume(1);
        }
        return this.next;
    };
    return OByte;
})(MozInstruction);
var OAny = (function (_super) {
    __extends(OAny, _super);
    function OAny(e, next) {
        _super.call(this, Moz.OAny, e, next);
    }
    OAny.prototype.exec = function (sc) {
        if (sc.hasUnconsumed()) {
            sc.consume(1);
        }
        return this.next;
    };
    return OAny;
})(MozInstruction);
var OStr = (function (_super) {
    __extends(OStr, _super);
    function OStr(e, next, str) {
        _super.call(this, Moz.OStr, e, next);
        this.str = str;
    }
    OStr.prototype.exec = function (sc) {
        if (sc.match(sc.pos, this.str)) {
            sc.consume(this.str.length);
        }
        return this.next;
    };
    return OStr;
})(MozInstruction);
var OSet = (function (_super) {
    __extends(OSet, _super);
    function OSet(e, next, bytemap) {
        _super.call(this, Moz.OSet, e, next);
        this.bytemap = bytemap;
    }
    OSet.prototype.exec = function (sc) {
        if (this.bytemap[sc.byteAt(sc.pos)]) {
            sc.consume(1);
        }
        return this.next;
    };
    return OSet;
})(MozInstruction);
var RByte = (function (_super) {
    __extends(RByte, _super);
    function RByte(e, next, byteChar) {
        _super.call(this, Moz.RByte, e, next);
        this.byteChar = byteChar;
    }
    RByte.prototype.exec = function (sc) {
        while (sc.byteAt(sc.pos) === this.byteChar) {
            sc.consume(1);
        }
        return this.next;
    };
    return RByte;
})(MozInstruction);
var RAny = (function (_super) {
    __extends(RAny, _super);
    function RAny(e, next) {
        _super.call(this, Moz.RAny, e, next);
    }
    RAny.prototype.exec = function (sc) {
        while (sc.hasUnconsumed()) {
            sc.consume(1);
        }
        return this.next;
    };
    return RAny;
})(MozInstruction);
var RStr = (function (_super) {
    __extends(RStr, _super);
    function RStr(e, next, str) {
        _super.call(this, Moz.RStr, e, next);
        this.str = str;
    }
    RStr.prototype.exec = function (sc) {
        while (sc.match(sc.pos, this.str)) {
            sc.consume(this.str.length);
        }
        return this.next;
    };
    return RStr;
})(MozInstruction);
var RSet = (function (_super) {
    __extends(RSet, _super);
    function RSet(e, next, bytemap) {
        _super.call(this, Moz.RSet, e, next);
        this.bytemap = bytemap;
    }
    RSet.prototype.exec = function (sc) {
        while (this.bytemap[sc.byteAt(sc.pos)]) {
            sc.consume(1);
        }
        return this.next;
    };
    return RSet;
})(MozInstruction);
var Consume = (function (_super) {
    __extends(Consume, _super);
    function Consume(e, next, shift) {
        _super.call(this, Moz.Consume, e, next);
        this.shift = shift;
    }
    Consume.prototype.exec = function (sc) {
        sc.consume(this.shift);
        return this.next;
    };
    return Consume;
})(MozInstruction);
var First = (function (_super) {
    __extends(First, _super);
    function First(e, next, jumpTable) {
        _super.call(this, Moz.First, e, next);
        this.jumpTable = jumpTable;
    }
    First.prototype.exec = function (sc) {
        var ch = sc.byteAt(sc.pos);
        return this.jumpTable[ch].exec(sc);
    };
    return First;
})(BranchTable);
var Lookup = (function (_super) {
    __extends(Lookup, _super);
    function Lookup(e, next, state, memoPoint, jump) {
        _super.call(this, Moz.Lookup, e, next);
        this.jump = jump;
        this.memoPoint = memoPoint;
        this.state = state;
    }
    Lookup.prototype.exec = function (sc) {
        var entry = sc.getMemo(this.memoPoint, this.state);
        if (entry !== null) {
            if (entry.failed) {
                return sc.fail();
            }
            sc.consume(entry.consumed);
            return this.jump;
        }
        return this.next;
    };
    return Lookup;
})(Branch);
var Memo = (function (_super) {
    __extends(Memo, _super);
    function Memo(e, next, state, memoPoint) {
        _super.call(this, Moz.Memo, e, next);
        this.state = state;
        this.memoPoint = memoPoint;
    }
    Memo.prototype.exec = function (sc) {
        var ppos = sc.popAlt();
        var length = sc.pos - ppos;
        sc.setMemo(ppos, this.memoPoint, false, null, length, this.state);
        return this.next;
    };
    return Memo;
})(MozInstruction);
var MemoFail = (function (_super) {
    __extends(MemoFail, _super);
    function MemoFail(e, next, state, memoPoint) {
        _super.call(this, Moz.MemoFail, e, next);
        this.state = state;
        this.memoPoint = memoPoint;
    }
    MemoFail.prototype.exec = function (sc) {
        sc.setMemo(sc.pos, this.memoPoint, true, null, 0, this.state);
        return sc.fail();
    };
    return MemoFail;
})(MozInstruction);
var TPush = (function (_super) {
    __extends(TPush, _super);
    function TPush(e, next) {
        _super.call(this, Moz.TPush, e, next);
    }
    TPush.prototype.exec = function (sc) {
        sc.astMachine.logPush();
        return this.next;
    };
    return TPush;
})(MozInstruction);
var TPop = (function (_super) {
    __extends(TPop, _super);
    function TPop(e, next, label) {
        _super.call(this, Moz.TPop, e, next);
        this.label = label;
    }
    TPop.prototype.exec = function (sc) {
        sc.astMachine.logPop(this.label);
        return this.next;
    };
    return TPop;
})(MozInstruction);
var TLeftFold = (function (_super) {
    __extends(TLeftFold, _super);
    function TLeftFold(e, next, shift, label) {
        _super.call(this, Moz.TLeftFold, e, next);
        this.shift = shift;
        this.label = label;
    }
    TLeftFold.prototype.exec = function (sc) {
        sc.astMachine.logLeftFold((sc.pos + this.shift) % 256, this.label);
        return this.next;
    };
    return TLeftFold;
})(MozInstruction);
var TNew = (function (_super) {
    __extends(TNew, _super);
    function TNew(e, next, shift) {
        _super.call(this, Moz.TNew, e, next);
        this.shift = shift;
    }
    TNew.prototype.exec = function (sc) {
        sc.astMachine.logNew((sc.pos + this.shift) % 256, this.id);
        return this.next;
    };
    return TNew;
})(MozInstruction);
var TCapture = (function (_super) {
    __extends(TCapture, _super);
    function TCapture(e, next, shift) {
        _super.call(this, Moz.TCapture, e, next);
        this.shift = shift;
    }
    TCapture.prototype.exec = function (sc) {
        sc.astMachine.logCapture((sc.pos + this.shift) % 256);
        return this.next;
    };
    return TCapture;
})(MozInstruction);
var TTag = (function (_super) {
    __extends(TTag, _super);
    function TTag(e, next, tag) {
        _super.call(this, Moz.TTag, e, next);
        this.tag = tag;
    }
    TTag.prototype.exec = function (sc) {
        sc.astMachine.logTag(this.tag);
        return this.next;
    };
    return TTag;
})(MozInstruction);
var TReplace = (function (_super) {
    __extends(TReplace, _super);
    function TReplace(e, next, str) {
        _super.call(this, Moz.TReplace, e, next);
        this.str = str;
    }
    TReplace.prototype.exec = function (sc) {
        sc.astMachine.logReplace(this.str);
        return this.next;
    };
    return TReplace;
})(MozInstruction);
var TStart = (function (_super) {
    __extends(TStart, _super);
    function TStart(e, next) {
        _super.call(this, Moz.TStart, e, next);
    }
    TStart.prototype.exec = function (sc) {
        var s = sc.newUnusedStack();
        s.ref = sc.astMachine.saveTransactionPoint();
        return this.next;
    };
    return TStart;
})(MozInstruction);
var TCommit = (function (_super) {
    __extends(TCommit, _super);
    function TCommit(e, next, label) {
        _super.call(this, Moz.TCommit, e, next);
        this.label = label;
    }
    TCommit.prototype.exec = function (sc) {
        var s = sc.popStack();
        sc.astMachine.commitTransactionPoint(this.label, s.ref);
        return this.next;
    };
    return TCommit;
})(MozInstruction);
var TAbort = (function (_super) {
    __extends(TAbort, _super);
    function TAbort(e, next) {
        _super.call(this, Moz.TAbort, e, next);
    }
    TAbort.prototype.exec = function (sc) {
        return this.next;
    };
    return TAbort;
})(MozInstruction);
var TLookup = (function (_super) {
    __extends(TLookup, _super);
    function TLookup(e, next, state, memoPoint, jump, label) {
        _super.call(this, Moz.TLookup, e, next);
        this.state = state;
        this.memoPoint = memoPoint;
        this.label = label;
        this.jump = jump;
    }
    TLookup.prototype.exec = function (sc) {
        var entry = sc.getMemo(this.memoPoint, this.state);
        if (entry != null) {
            if (entry.failed) {
                return sc.fail();
            }
            sc.consume(entry.consumed);
            sc.astMachine.logLink(this.label, entry.result);
            return this.jump;
        }
        return this.next;
    };
    return TLookup;
})(Branch);
var TMemo = (function (_super) {
    __extends(TMemo, _super);
    function TMemo(e, next, state, memoPoint) {
        _super.call(this, Moz.TMemo, e, next);
        this.state = state;
        this.memoPoint = memoPoint;
    }
    TMemo.prototype.exec = function (sc) {
        var ppos = sc.popAlt();
        var length = sc.pos - ppos;
        sc.setMemo(ppos, this.memoPoint, false, sc.astMachine.getLatestLinkedNode(), length, this.state);
        return this.next;
    };
    return TMemo;
})(MozInstruction);
var SOpen = (function (_super) {
    __extends(SOpen, _super);
    function SOpen(e, next) {
        _super.call(this, Moz.SOpen, e, next);
    }
    SOpen.prototype.exec = function (sc) {
        var s = sc.newUnusedStack();
        s.value = sc.symbolTable.savePoint();
        return this.next;
    };
    return SOpen;
})(MozInstruction);
var SClose = (function (_super) {
    __extends(SClose, _super);
    function SClose(e, next) {
        _super.call(this, Moz.SClose, e, next);
    }
    SClose.prototype.exec = function (sc) {
        var s = sc.popStack();
        sc.symbolTable.rollBack(s.value);
        return this.next;
    };
    return SClose;
})(MozInstruction);
var SMask = (function (_super) {
    __extends(SMask, _super);
    function SMask(e, next, table) {
        _super.call(this, Moz.SMask, e, next);
        this.table = table;
    }
    SMask.prototype.exec = function (sc) {
        var s = sc.newUnusedStack();
        var st = sc.symbolTable;
        s.value = st.savePoint();
        st.addSymbolMask(this.table);
        return this.next;
    };
    return SMask;
})(MozInstruction);
var SDef = (function (_super) {
    __extends(SDef, _super);
    function SDef(e, next, table) {
        _super.call(this, Moz.SDef, e, next);
        this.table = table;
    }
    SDef.prototype.exec = function (sc) {
        var top = sc.popStack();
        var captured = sc.slice(top.value, sc.pos);
        sc.symbolTable.addSymbol(this.table, captured);
        return this.next;
    };
    return SDef;
})(MozInstruction);
var SIsDef = (function (_super) {
    __extends(SIsDef, _super);
    function SIsDef(e, next, table, str) {
        _super.call(this, Moz.SIsDef, e, next);
        this.table = table;
        this.str = str;
    }
    SIsDef.prototype.exec = function (sc) {
        if (sc.symbolTable.contains(this.table, this.str)) {
            return this.next;
        }
        return sc.fail();
    };
    return SIsDef;
})(MozInstruction);
var SExists = (function (_super) {
    __extends(SExists, _super);
    function SExists(e, next, table) {
        _super.call(this, Moz.SExists, e, next);
        this.table = table;
    }
    SExists.prototype.exec = function (sc) {
        if (sc.symbolTable.getSymbol(this.table) !== null) {
            return this.next;
        }
        return sc.fail();
    };
    return SExists;
})(MozInstruction);
var SMatch = (function (_super) {
    __extends(SMatch, _super);
    function SMatch(e, next, table) {
        _super.call(this, Moz.SMatch, e, next);
        this.table = table;
    }
    SMatch.prototype.exec = function (sc) {
        var t = sc.symbolTable.getSymbol(this.table);
        if (t === null) {
            return this.next;
        }
        if (sc.match(sc.pos, t)) {
            sc.consume(t.length);
            return this.next;
        }
        return sc.fail();
    };
    return SMatch;
})(MozInstruction);
var SIs = (function (_super) {
    __extends(SIs, _super);
    function SIs(e, next, table) {
        _super.call(this, Moz.SIs, e, next);
        this.table = table;
    }
    SIs.prototype.exec = function (sc) {
        var t = sc.symbolTable.getSymbol(this.table);
        if (t !== null) {
            var s = sc.popStack();
            var captured = sc.slice(s.value, sc.pos);
            if (t === captured) {
                return this.next;
            }
            ;
        }
        return sc.fail();
    };
    return SIs;
})(MozInstruction);
var SIsa = (function (_super) {
    __extends(SIsa, _super);
    function SIsa(e, next, table) {
        _super.call(this, Moz.SIsa, e, next);
        this.table = table;
    }
    SIsa.prototype.exec = function (sc) {
        var s = sc.popStack();
        var captured = sc.slice(s.value, sc.pos);
        if (sc.symbolTable.contains(this.table, captured)) {
            return this.next;
        }
        return sc.fail();
    };
    return SIsa;
})(MozInstruction);
var SDefNum = (function (_super) {
    __extends(SDefNum, _super);
    function SDefNum(e, next, table) {
        _super.call(this, Moz.SDefNum, e, next);
        this.table = table;
    }
    SDefNum.prototype.exec = function (sc) {
        return null;
    };
    return SDefNum;
})(MozInstruction);
var SCount = (function (_super) {
    __extends(SCount, _super);
    function SCount(e, next, table) {
        _super.call(this, Moz.SCount, e, next);
        this.table = table;
    }
    SCount.prototype.exec = function (sc) {
        return null;
    };
    return SCount;
})(MozInstruction);
var Exit = (function (_super) {
    __extends(Exit, _super);
    function Exit(state) {
        _super.call(this, Moz.Exit, null, null);
        this.state = state;
    }
    Exit.prototype.exec = function (sc) {
        var ast = sc.astMachine.getParseResult();
        return null;
    };
    return Exit;
})(MozInstruction);
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(e, next, _nonTerminal) {
        _super.call(this, Moz.Label, e, next);
        this._nonTerminal = _nonTerminal;
    }
    Object.defineProperty(Label.prototype, "nonTerminal", {
        get: function () {
            return this._nonTerminal;
        },
        enumerable: true,
        configurable: true
    });
    Label.prototype.exec = function (sc) {
        return this.next;
    };
    return Label;
})(MozInstruction);
var Ref = (function (_super) {
    __extends(Ref, _super);
    function Ref(id) {
        _super.call(this, 0, null, null);
        this.id = id;
    }
    Ref.prototype.exec = function () {
        return null;
    };
    return Ref;
})(Instruction);
var MozLoader = (function () {
    function MozLoader() {
        this.pos = 0;
    }
    MozLoader.prototype.read_u8 = function () {
        return this.buf.readUIntBE(this.pos++, 1);
    };
    MozLoader.prototype.uread = function () {
        var n = this.buf[this.pos++];
        return n & 0xff;
    };
    MozLoader.prototype.read = function (num) {
        if (num === void 0) { num = 1; }
        var s = "";
        s = this.buf.toString("utf-8", this.pos, this.pos + num);
        this.pos += num;
        return s;
    };
    MozLoader.prototype.read_u16 = function () {
        var n = this.buf.readUInt16BE(this.pos);
        this.pos += 2;
        return n;
    };
    MozLoader.prototype.read_u24 = function () {
        var n = this.read_u16();
        n = n << 8 | this.read_u8();
        return n;
    };
    MozLoader.prototype.read_u32 = function () {
        var n = this.buf.readUInt32BE(this.pos);
        this.pos += 4;
        return n;
    };
    MozLoader.prototype.read_utf8 = function () {
        var len = this.read_u16();
        var str = this.read(len);
        if (this.read_u8() !== 0) {
            throw new Error("moz format error");
        }
        return str;
    };
    MozLoader.prototype.read_b = function () {
        return this.uread() == 0 ? true : false;
    };
    MozLoader.prototype.read_bytemap = function () {
        var b = [];
        for (var i = 0; i < 256; i += 32) {
            this.read_bytemap_inner(b, i);
        }
        return b;
    };
    MozLoader.prototype.read_bytemap_inner = function (b, offset) {
        var u = this.read_u32();
        for (var i = 0; i < 32; i++) {
            var flag = 1 << i;
            if ((u & flag) === flag) {
                b[offset + i] = true;
            }
        }
    };
    MozLoader.prototype.readByte = function () {
        return this.uread();
    };
    MozLoader.prototype.readBstr = function () {
        return this.poolBstr[this.read_u16()];
    };
    MozLoader.prototype.readBset = function () {
        return this.poolBset[this.read_u16()];
    };
    MozLoader.prototype.readTable = function () {
        var id = this.read_u16();
        return this.poolTable[id];
    };
    MozLoader.prototype.readShift = function () {
        return this.read_u8();
    };
    MozLoader.prototype.readJump = function () {
        var id = this.read_u24();
        if (!(id < this.instSize)) {
            console.log("r: " + id);
        }
        return new Ref(id);
    };
    MozLoader.prototype.readNonTerminal = function () {
        var id = this.read_u16();
        return this.poolNonTerminal[id];
    };
    MozLoader.prototype.readState = function () {
        return this.read_b();
    };
    MozLoader.prototype.readLabel = function () {
        var id = this.read_u16();
        var l = this.poolTag[id];
        return (l == null) ? null : l;
    };
    MozLoader.prototype.readTag = function () {
        var id = this.read_u16();
        return this.poolTag[id];
    };
    MozLoader.prototype.readMemoPoint = function () {
        return this.read_u32();
    };
    MozLoader.prototype.readJumpTable = function () {
        var table = [];
        for (var i = 0; i < 257; i++) {
            table[i] = this.readJump();
        }
        return table;
    };
    MozLoader.prototype.loadCode = function (buf, debug) {
        this.buf = buf;
        if (this.read() !== "N" || this.read() !== "E" || this.read() !== "Z") {
            throw new Error("non moz format");
        }
        var version = this.read();
        this.instSize = this.read_u16();
        this.memoSize = this.read_u16();
        var jumpTableSize = this.read_u16();
        var pool = this.read_u16();
        this.poolNonTerminal = [];
        for (var i = 0; i < pool; i++) {
            this.poolNonTerminal[i] = this.read_utf8();
        }
        pool = this.read_u16();
        this.poolBset = [[]];
        for (var i = 0; i < pool; i++) {
            this.poolBset[i] = this.read_bytemap();
        }
        pool = this.read_u16();
        this.poolBstr = [];
        for (var i = 0; i < pool; i++) {
            this.poolBstr[i] = this.read_utf8();
        }
        pool = this.read_u16();
        this.poolTag = [];
        for (var i = 0; i < pool; i++) {
            this.poolTag[i] = Symbol.tag(this.read_utf8());
        }
        pool = this.read_u16();
        this.poolTable = [];
        for (var i = 0; i < pool; i++) {
            this.poolTable[i] = Symbol.tag(this.read_utf8());
        }
        if (debug) {
            console.log("load moz File...");
            console.log("Version: " + version);
            console.log("InstructionSize: " + this.instSize);
            console.log("MemoSize: " + this.memoSize);
            console.log("JumpTableSize: " + jumpTableSize);
            console.log("pos= " + this.pos);
        }
        this.codeList = [];
        for (var i = 0; i < this.instSize; i++) {
            this.loadInstruction();
        }
        if (this.pos !== this.buf.length) {
            throw new Error("moz format error");
        }
        for (var i = 0; i < this.instSize; i++) {
            var inst = this.codeList[i];
            inst.next = this.codeList[inst.next.id];
            if (inst instanceof Branch) {
                inst.jump = this.codeList[inst.jump.id];
            }
            if (inst instanceof BranchTable) {
                for (var j = 0; j < inst.jumpTable.length; j++) {
                    inst.jumpTable[j] = this.codeList[inst.jumpTable[j].id];
                }
            }
        }
    };
    MozLoader.prototype.loadInstruction = function () {
        var opcode = this.uread();
        var jumpNext = ((opcode & 128) == 128);
        opcode = 127 & opcode;
        var inst = this.newInstruction(opcode);
        inst.id = this.codeList.length;
        this.codeList.push(inst);
        if (jumpNext) {
            inst.next = this.readJump();
        }
        else {
            inst.next = new Ref(this.codeList.length);
        }
    };
    MozLoader.prototype.newInstruction = function (opcode) {
        var jump;
        var nonTerminal;
        var byteChar;
        var utf8;
        var byteMap;
        var shift;
        var state;
        var tag, label;
        var memoPoint;
        var jumpTable;
        var table;
        switch (opcode) {
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
            case 127:
            case Moz.Label: {
                nonTerminal = this.readNonTerminal();
                return new Label(null, null, nonTerminal);
            }
        }
    };
    MozLoader.prototype.showBuf = function () {
        console.log(this.buf.toJSON());
    };
    return MozLoader;
})();
var MozManager = (function () {
    function MozManager() {
    }
    MozManager.prototype.init = function () {
        var fs = require("fs");
        if (this.config.repetition === undefined) {
            this.config.repetition = 1;
        }
        this.input = this.config.inputText;
        if (this.input === undefined) {
            this.input = fs.readFileSync(this.config.inputPath, "utf-8");
        }
        if (!this.config.mozInstruction) {
            this.mozCode = fs.readFileSync(this.config.mozPath);
            var ml = new MozLoader();
            this.config.debug = this.config.debug ? this.config.debug : false;
            ml.loadCode(this.mozCode, this.config.debug);
            this.config.mozInstruction = ml.codeList;
            this.config.memoSize = ml.memoSize;
        }
    };
    MozManager.prototype.parse = function (config) {
        this.config = config;
        this.init();
        var ast, start, end, sc, inst;
        for (var i = 0; i < this.config.repetition; i++) {
            sc = new RuntimeContext(this.input, new ElasticTable(this.config.memoSize));
            inst = this.config.mozInstruction[0];
            start = Date.now();
            while (inst !== null) {
                inst = inst.exec(sc);
            }
            if (config.printAST) {
                ast = sc.astMachine.getParseResult();
                console.log(ast.toString());
                end = Date.now();
                console.log((end - start) + " ms");
            }
        }
        return sc.astMachine.getParseResult();
    };
    return MozManager;
})();
module.exports = new MozManager();
