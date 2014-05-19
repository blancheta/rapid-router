'use strict';

var ocargo = ocargo || {};

ocargo.Level = function(map, van, ui) {
    this.levelId = null;
    this.map = map;
    this.van = van;
    this.ui = ui;
    this.correct = 0;
    this.attemptData = {};
};

ocargo.Level.prototype.play = function(program){

    this.attemptData = {};
    // TODO: Circular references in programmStack, cannot stringify it just yet. 
    //var programStack = JSON.stringify(program.stack);
    var commandStack = [];
    for (var i = 0; i < program.stack.length; i++) {
        for(var j = 0; j < program.stack[i].length; j++) {
            var command = ocargo.level.recogniseCommand(program.stack[i][j]);
            commandStack.push(command);
            console.debug(program.stack[i][j], command);
        }
    }
    console.debug(commandStack, JSON.stringify(commandStack));
    this.attemptData['commandStack'] = JSON.stringify(commandStack);
    // TODO: calculate score
    program.startBlock.select();

    var stepFunction = stepper(this);

    program.stepCallback = stepFunction;
    this.program = program;
    setTimeout(stepFunction, 500);
};

ocargo.Level.prototype.recogniseCommand = function(command) {
    if (command instanceof ForwardCommand) {
        return 'Forward';
    } else if (command instanceof TurnLeftCommand) {
        return 'Left';
    } else if (command instanceof TurnRightCommand) {
        return 'Right';
    } else if (command instanceof TurnAroundCommand) {
        return 'TurnAround';
    } else if (command instanceof While) {
        // Actually thiink about putting in all the needed data in another json.
        return 'While'
    } else if (command instanceof If) {
        return 'If'; 
    }
};

ocargo.Level.prototype.step = function(){
    if(this.program.canStep()) {
        this.program.step(this);

    } else {
    	if (this.van.currentNode === this.map.destination && !this.program.isTerminated) {
            this.win();
        }
    }
};

ocargo.Level.prototype.win = function() {
    console.debug('You win!');
    ocargo.sound.win();
    window.alert('You win!');
};

ocargo.Level.prototype.fail = function(msg) {
    console.debug('Oh dear! :(');
    ocargo.sound.failure();
    window.alert(msg);
};

function stepper(level){
	return function(){
        try {
    		if(level.program.canStep()) {
                level.correct = level.correct + 1;
    			level.program.step(level);
    	    } else {
                if (level.van.currentNode === level.map.destination && !level.program.isTerminated) {
                    level.win();
                } else {
                    level.fail("Oh dear! :( You ran out of instructions!");

                    level.program.terminate();
                }
            }
        } catch (error) {
            level.program.terminate();
        }
	};
}

function InstructionHandler(level){
	this.level = level;
}

InstructionHandler.prototype.handleInstruction = function(instruction, program){
	console.debug('Calculating next node for instruction ' + instruction.name);
    var nextNode = instruction.getNextNode(this.level.van.previousNode, this.level.van.currentNode);

    if (!nextNode) {
        var n = this.level.correct - 1;
        ocargo.blocklyControl.blink();

        this.level.fail("Oh dear! :( Your first " + n + " instructions were right."
            + " Click 'Clear Incorrect' to remove the incorrect blocks and try again!");

        program.terminate();
        return; //TODO: animate the crash
    }

    this.level.van.move(nextNode, instruction, program.stepCallback);
};

$("#play").click(function() {
    if (ocargo.level.levelId) {
        ocargo.level.attemptData['level'] = ocargo.level.levelId.toString();
        var attemptData = JSON.stringify(ocargo.level.attemptData);
        console.debug(attemptData);
        $.ajax({
            url : "/game/submit",
            type : "POST",
            dataType: 'json',
            data : {
               attemptData : attemptData,
               csrfmiddlewaretoken :$( "#csrfmiddlewaretoken" ).val()
           },
           success : function(json) {
           },
           error : function(xhr,errmsg,err) {
                console.debug(xhr.status + ": " + errmsg + " " + err + " " + xhr.responseText);
            }
        });
    }
    return false;
});
