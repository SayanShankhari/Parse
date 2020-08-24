/*
** This file is used to parse XML format file with read and write;
** This code uses a mini automaton for state transfer
** You can run in NodeJS server;
** $ node parse.js input.html output.txt
** List of Operations;
	function fileReadOperaion () {}		-- Not done yet
	function preStateOperation () {}	-- Successful
	function stateOperation () {}		-- Successful
	function postStateOperation () {}	-- Successful
	function stackOperation () {}		-- Successful
	function elementTreeOperation() {}	-- Failed
	function fileWriteOperaion () {}	-- Not done yet
** 
*/

var stack = [];
var line = 0, character = 0;

var insideComment = false;
var insideString = false;
var insideElement = false;
var insideContent = false;

var trash = null;
var debugCounter = 0;

const symbols = ['!', '<', '-', '/', '>'];
const transition = [
	[1, 0, 0, 0, 0, 0],
	[1, 2, 1, 8, 1, 7],
	[2, 2, 3, 2, 2, 0],
	[3, 3, 4, 3, 3, 3],
	[4, 4, 5, 4, 4, 4],
	[5, 5, 6, 5, 5, 4],
	[6, 6, 6, 6, 0, 4],
	[7, 7, 7, 9, 0, 7],
	[8, 8, 8, 8, 8, 7],
	[9, 9, 9, 9, 0, 9]
];

class Node {
	constructor (tag, parent, text, children) {
		this.tag = tag;
		this.parent = parent;
		this.text = text;
		this.children = children;
	}
}
9933673191
var tree = new Node ("root", null, "", []);
tree.parent = tree;
var currentNode = tree;

var tagBuffer = "";
var nodeTextBuffer = "";
var character = undefined;
var symbol = undefined;
var state = 0;

function parse_XML (code) {	// Main Function to Call from Outside
	for (var i = 0; i < code.length; i++) {
		character = code [i];
		symbol = getSymbolFromCharacter (character);
		// -----------------------------	// Pre-transition operation
		state = transition [state][symbol];	// State Transition in DFA
		stateOperation (character, state);	// Post-transition operation
		
		if (insideElement) {	// Adding to new tag-name buffer
			tagBuffer += character;
		} else {
			if (tagBuffer != "") {
				processBuffer(tagBuffer);
			}
			tagBuffer = "";
		}

		if (insideContent) {
			nodeTextBuffer += character;
		}
		
		insideContent = true;
	}

	console.log(stack);
	console.log(tree);
}

function getSymbolFromCharacter (character) {
	var i = 0;
	
	for( ; i < 5; i++) {
		if (symbols[i] == character) {
			break;
		}
	}
	
	return i;
}

function stateOperation (character, state) {
	if (state == 4) {
		insideComment = true;
	} else if (state == 0 && insideComment) {
		insideComment = false;
	}
	
	if (state == 7 || state == 8) {
		insideElement = true;
		insideContent = false;
	} else if (insideElement && state == 0) {
		insideElement = false;
		insideContent = true;
	}

	if ((character == "'" || character == '"') && !insideComment) {
		insideString = !insideString;
	}
}

function processBuffer (tagBuffer) {
	var tag = "";
	
	for (var i = 0; i < tagBuffer.length; i++) {
		if (tagBuffer[i] == " ") {
			break;
		}
		tag += tagBuffer[i];
	}

	processStack (tag);	// Push to Tag-Stack
	processDocumentTree();
}

function processStack (newTag) {
	stack.push (newTag);
}

function processDocumentTree() {
	var stackTop = stack [stack.length - 1];

	if (stackTop[0] != "/") {
		// New tag
		if (!currentNodeIsContainer()) {
			currentNode = currentNode.parent;
		}

		currentNode.text += trimNodeTextContent(nodeTextBuffer);
		nodeTextBuffer = "";

		currentNode.children.push (new Node (stackTop, currentNode, "", []));
		currentNode = currentNode.children [currentNode.children.length - 1];
		trash = stack.pop();
	} else {
		// End tag
		if (stackTop.substring (1) == currentNode.tag) {
			currentNode = currentNode.parent;
			trash = stack.pop();
		} else {
			
		}

		trash = stack.pop();
	}
}

function currentNodeIsContainer() {
	for (var i = 0; i < htmlTagsList.length; i++) {
		if (currentNode.tag == htmlTagsList[i][0]) {
			break;
		}
	}

	return htmlTagsList[i][1];
}

function trimNodeTextContent (textContent) {
	var index;

	for (var i = 0; i < textContent.length; i++) {
		if (textContent[i] == "<" || textContent[i] == ">") {
			index = i;
		}
	}

	return textContent.substring (0, index);
}