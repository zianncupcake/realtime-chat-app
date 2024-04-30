package com.zianncupcake.chat.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    //when new user connects to chat appliation. need to hit that endpoint and inform other users that new users join the chat
    @MessageMapping("/chat.addUser") //annotation: url used to invoke this method. this is the endpoint
    @SendTo("/topic/public") //annotation: to which stash aka topic we want to send this message to. payload will be queued here whenever it is called

    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor ) {
        //add username in websocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;

    }

    //dispatch message that will be sent by the user
    //create payload/object
    @MessageMapping("/chat.sendMessage") //annotation: url used to invoke this method. this is the endpoint
    @SendTo("/topic/public") //annotation: to which stash aka topic we want to send this message to. payload will be queued here whenever it is called
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }
}
