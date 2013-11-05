var Multiplayer = Object.extend({
    init : function (new_player) {
        this.pubnub = PUBNUB.init({
            publish_key   : "pub-c-18fa4ad5-4e51-4a7f-87b0-afe68bc9b117",
            subscribe_key : "sub-c-b3b0f2e6-4669-11e3-aab4-02ee2ddab7fe"
        });

        this.new_player = new_player;

        // Record my UUID, so I don't process my own messages
        this.UUID = this.pubnub.uuid();

        // Listen for incoming messages
        this.pubnub.subscribe({
            channel : "PubNub-melonJS-demo",
            message : this.handleMessage.bind(this)
        });
    },

    handleMessage : function (msg) {
        // Did I send this message?
        if (msg.UUID === this.UUID)
            return;

        // Get a reference to the object for the player that sent 
        // this message
        var obj = me.game.getEntityByName(msg.UUID);
        if (obj.length) {
            obj = obj[0];
        }
        else {
            var x = obj.pos && obj.pos.x || 50;
            var y = obj.pos && obj.pos.y || 50;
            obj = this.new_player(x, y);
            obj.name = msg.UUID;
        }

        // Route message
        switch (msg.action) {
        case "update":
            // Position update
            obj.pos.setV(msg.pos);
            obj.vel.setV(msg.vel);
            break;

        // TODO: Define more actions here
        }
    },

    sendMessage : function (msg) {
        msg.UUID = this.UUID;

        this.pubnub.publish({
            channel : "PubNub-melonJS-demo",
            message : msg
        });
    }
});
