import * as ts from 'typescript';
import * as fs from 'fs';
import "process";
function getClassInterfaceFromFile(fileName, className) {
    const tsCode = fs.readFileSync(fileName, 'utf-8');
    return getClassInterface(tsCode, className);
}
function getClassInterface(tsCode, className) {
    const sourceFile = ts.createSourceFile('temp.ts', tsCode, ts.ScriptTarget.Latest, true);
    let interfaceCode = '';
    let indentation = '    ';
    function visit(node) {
        var _a, _b;
        if (ts.isClassDeclaration(node) && (!className || ((_a = node.name) === null || _a === void 0 ? void 0 : _a.getText()) === className)) {
            // Extract class comments
            const comments = ts.getLeadingCommentRanges(sourceFile.getFullText(), node.pos);
            if (comments) {
                interfaceCode += sourceFile.getFullText().substring(comments[0].pos, node.pos);
            }
            // Generate interface from class
            interfaceCode += `interface ${(_b = node.name) === null || _b === void 0 ? void 0 : _b.getText()} {`;
            node.members.forEach((member) => {
                if (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member)) {
                    const memberComments = ts.getLeadingCommentRanges(sourceFile.getFullText(), member.pos);
                    if (memberComments) {
                        interfaceCode += "\n" + indentation + sourceFile
                            .getFullText()
                            .substring(memberComments[0].pos, memberComments[0].end) + "\n";
                    }
                    if (ts.isPropertyDeclaration(member)) {
                        interfaceCode += "\n" + indentation + `${member.name.getText()}: ${sourceFile
                            .getFullText()
                            .substring(member.type.pos, member.type.end)};`;
                    }
                    else if (ts.isMethodDeclaration(member)) {
                        interfaceCode += indentation + `${member.name.getText()}(${member.parameters
                            .map((param) => param.getText())
                            .join(', ')}): ${sourceFile
                            .getFullText()
                            .substring(member.type.pos, member.type.end)};` + "\n";
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
const fileName = process.argv[2];
const interfaceCode = getClassInterfaceFromFile(fileName, process.argv[3]);
console.log(interfaceCode);
//# sourceMappingURL=tsClassToInterface.js.map