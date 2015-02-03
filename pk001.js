if (Meteor.isClient) {
	Template.welcome.events({
		'click #enter':function() {
			Player.update({_id: 'p001'}, {$set: {roomAt: 'r001'}});
			$('#enter').remove();
			$('.welcome').remove();
			$('.exits').show();
		}
	}),
	Template.roomTitle.helpers({
		roomTitle:function() {
			return Rooms.find({_id: Player.find({_id: 'p001'}).fetch()[0].roomAt}).fetch()[0].title;
		}
	}),
	Template.roomDesc.helpers({
		roomDesc:function() {
			return Rooms.find({_id: Player.find({_id: 'p001'}).fetch()[0].roomAt}).fetch()[0].desc;
		}
	}),
	Template.roomExits.helpers({
		roomExits:function() {
			for (var key in Rooms.find({_id: Player.find({_id: 'p001'}).fetch()[0].roomAt}).fetch()[0].exits) {
				var targetExit = '.' + key + 'exit';
				if (Rooms.find({_id: Player.find({_id: 'p001'}).fetch()[0].roomAt}).fetch()[0].exits[key]) {
					$(targetExit).removeClass('exitTrue');
					$(targetExit).removeClass('exitFalse');
					$(targetExit).addClass('exitTrue');
				} else {
					$(targetExit).removeClass('exitTrue');
					$(targetExit).removeClass('exitFalse');
					$(targetExit).addClass('exitFalse');
				}
			}
		}
	}),

	//Various helpers for Template.roomExits.events


	Template.roomExits.events({
		'click .northexit':function() {
			if (engine.hasExit(engine.playerCurrentRoom(),'north')) {
				engine.clearPlayerEventLog();
				engine.movePlayer('north');
			}
		},
		'click .eastexit':function() {
			if (engine.hasExit(engine.playerCurrentRoom(),'east')) {
				engine.clearPlayerEventLog();
				engine.movePlayer('east');			
			}
		},
		'click .southexit':function() {
			if (engine.hasExit(engine.playerCurrentRoom(),'south')) {
				engine.clearPlayerEventLog();
				engine.movePlayer('south');
			}
		},
		'click .westexit':function() {
			if (engine.hasExit(engine.playerCurrentRoom(),'west')) {
				engine.clearPlayerEventLog();
				engine.movePlayer('west');
			}
		},
		'click .upexit':function() {
			if (engine.hasExit(engine.playerCurrentRoom(),'up')) {
				engine.clearPlayerEventLog();
				engine.movePlayer('up');
			}
		},
		'click .downexit':function() {
			if (engine.hasExit(engine.playerCurrentRoom(),'down')) {
				engine.clearPlayerEventLog();
				engine.movePlayer('down');
			}
		},
	})
	Template.roomMobs.helpers({
		roomMobs:function() {
			return Rooms.find({_id: Player.find({_id: 'p001'}).fetch()[0].roomAt}).fetch()[0].mobs;
		}
	}),
	Template.eventDisplay.helpers({
		eventDisplay: function(){
			return Player.find({_id: 'p001'}).fetch()[0].eventLog
		}

	}),
	Template.roomMobs.events({
    'click span.mobclick':function(event) {
      $('#menu').css('left', event.pageX+5);
      $('#menu').css('top', event.pageY+5);
      $('#menu').fadeToggle();
      Session.set('clickId', this._id)
    }
	}),
	Template.roomItems.events({
    'click span.itemclick':function(event) {
      $('#menu').css('left', event.pageX+5);
      $('#menu').css('top', event.pageY+5);
      $('#menu').fadeToggle();
      Session.set('itemId', this._id);
    }
	}),
	Template.roomItems.helpers({
		roomItems:function() {
			return Rooms.find({_id: Player.find({_id: 'p001'}).fetch()[0].roomAt}).fetch()[0].items;
		}
	}),
	Template.contextMenu.events({
    'click .menuItemCancel':function() {
      $('#menu').fadeToggle();
    },
    'click .menuItemSpeak':function(){
    	$('#menu').fadeToggle();
    	var currentMob = Session.get('clickId');
    	var diaStatus = Dialogue.find({_id: currentMob}).fetch()[0].diaStatus[0];
    	// If mob has dialogue, echo in event log
    	if (Dialogue.find({_id: currentMob}).fetch()[0][diaStatus].convo) {
    		engine.echoPlayerEventLog(Dialogue.find({_id: currentMob}).fetch()[0][diaStatus].convo);
    	}
    	//If there is a script to run, run from quest engine
    	if (Dialogue.find({_id: currentMob}).fetch()[0][diaStatus].hasScript) {
				questEngine[Dialogue.find({_id: currentMob}).fetch()[0][diaStatus].hasScript].s1();
			}
		//If dialogue requires player input, show the dialogue response div
    	if (Dialogue.find({_id: currentMob}).fetch()[0][diaStatus].response.length >= 1) {
    		$('.dialogueResponse').show();
    	}
    	//If dialogue doesn't require input and needs to move, move status to next convo
    	if (Dialogue.find({_id: currentMob}).fetch()[0][diaStatus].next1.length >= 1) {
    		Dialogue.update({_id: currentMob}, {$set: {diaStatus: Dialogue.find({_id: currentMob}).fetch()[0][diaStatus].next1}});
    	}
    },
    'click .menuItemAttack':function () {
    	$('#menu').fadeToggle();
    	var currentMob = Session.get('clickId');
    	var mobAttackTrigger = Mobs.findOne({_id: currentMob}).attackTrigger;
    	questEngine[mobAttackTrigger].s1();
    },
    'click .menuItemInspect':function () {
    	$('#menu').fadeToggle();
    	var currentItem = Session.get('itemId');
    	var currentRoom = Player.findOne({_id: 'p001'}).roomAt;
    	//pick up the item
    	engine.echoPlayerEventLog('You pick up ' + Items.findOne({_id: currentItem}).shortDesc + '.');
    	//pulls/removes items from the room
    	Rooms.update({_id: currentRoom}, {$pull: {items: {_id: currentItem}}});
    	//if there is a script attached to item, fire it
    	if (Items.findOne({_id: currentItem}).questTrigger) {
				questEngine[Items.findOne({_id: currentItem}).questTrigger].s1();
			}
    }
	}),
	Template.dialogueResponse.helpers({
		dialogueResponse:function(){
			var diaStatus = Dialogue.find({_id: Session.get('clickId')}).fetch()[0].diaStatus[0];
			var response = Dialogue.find({_id: Session.get('clickId')}).fetch()[0][diaStatus].response;
			var responseText = [];
			for (i=0;i<response.length;i++) {
				responseText.push(Dialogue.find({_id: Session.get('clickId')}).fetch()[0][response[i]])
			}
			return responseText;

		}
	}),
	Template.dialogueResponse.events({
		'click .rclick ':function() {
			var currentMob = Session.get('clickId');
			Session.set('rclick', this._id);
			var responseClicked = Session.get('rclick');
			var diaStatus = Dialogue.findOne({_id: currentMob}).diaStatus[0];
			//Echos response clicked to event log.
			engine.echoPlayerEventLog(Dialogue.find({_id: currentMob}).fetch()[0][responseClicked].convo);
			//Hides the dialogue response div
			$('.dialogueResponse').hide();
			//If the response has a script, run the script from quest engine
			if (Dialogue.find({_id: currentMob}).fetch()[0][responseClicked].hasScript) {
				questEngine[Dialogue.find({_id: currentMob}).fetch()[0][responseClicked].hasScript].s1();
			}
			//Update the status of the convo
			if (Dialogue.find({_id: currentMob}).fetch()[0][responseClicked].next1.length >=1) {
				Dialogue.update({_id: currentMob}, {$set: {diaStatus: Dialogue.find({_id: currentMob}).fetch()[0][responseClicked].next1}});
			}
			//If the convo continues with a response, echo to event log
			if (Dialogue.find({_id: currentMob}).fetch()[0][responseClicked].next1.length >=1 ) {
				var nextConvo = Dialogue.find({_id: currentMob}).fetch()[0][responseClicked].next1[0];
				engine.echoPlayerEventLog(Dialogue.find({_id: currentMob}).fetch()[0][nextConvo].convo);
				//If there is another response, show response
				if (Dialogue.find({_id: currentMob}).fetch()[0][nextConvo].response.length >= 1) {
					$('.dialogueResponse').show();
				}
				//If there is a scirpt in continue conversation.
				if (Dialogue.find({_id: currentMob}).fetch()[0][nextConvo].hasScript) {
					questEngine[Dialogue.find({_id: currentMob}).fetch()[0][nextConvo].hasScript].s1();
				}				
			}
		}
	})


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
