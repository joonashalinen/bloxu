"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
require("process");
function getClassInterfaceFromFile(fileName, className) {
    var tsCode = fs.readFileSync(fileName, 'utf-8');
    return getClassInterface(tsCode, className);
}
function getClassInterface(tsCode, className) {
    var sourceFile = ts.createSourceFile('temp.ts', tsCode, ts.ScriptTarget.Latest, true);
    var interfaceCode = '';
    var indentation = '    ';
    function visit(node) {
        var _a, _b;
        if (ts.isClassDeclaration(node) && (!className || ((_a = node.name) === null || _a === void 0 ? void 0 : _a.getText()) === className)) {
            // Extract class comments
            var comments = ts.getLeadingCommentRanges(sourceFile.getFullText(), node.pos);
            if (comments) {
                interfaceCode += sourceFile.getFullText().substring(comments[0].pos, node.pos);
            }
            // Generate interface from class
            interfaceCode += "interface ".concat((_b = node.name) === null || _b === void 0 ? void 0 : _b.getText(), " {");
            node.members.forEach(function (member) {
                if (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member)) {
                    var memberComments = ts.getLeadingCommentRanges(sourceFile.getFullText(), member.pos);
                    if (memberComments) {
                        interfaceCode += "\n" + indentation + sourceFile
                            .getFullText()
                            .substring(memberComments[0].pos, memberComments[0].end) + "\n";
                    }
                    if (ts.isPropertyDeclaration(member)) {
                        interfaceCode += "\n" + indentation + "".concat(member.name.getText(), ": ").concat(sourceFile
                            .getFullText()
                            .substring(member.type.pos, member.type.end), ";");
                    }
                    else if (ts.isMethodDeclaration(member)) {
                        interfaceCode += indentation + "".concat(member.name.getText(), "(").concat(member.parameters
                            .map(function (param) { return param.getText(); })
                            .join(', '), "): ").concat(sourceFile
                            .getFullText()
                            .substring(member.type.pos, member.type.end), ";") + "\n";
                    }
                }
            });
            interfaceCode += '}';
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return interfaceCode || null;
}
var fileName = process.argv[2];
var interfaceCode = getClassInterfaceFromFile(fileName, process.argv[3]);
console.log(interfaceCode);
