"use client";
import "./styles.css";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Box, Stack, TextField, Button, AppBar, Typography, IconButton, Dialog } from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello, how can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage("");
    setMessages([
      ...messages,
      {
        role: "user",
        content: message,
      },
      { role: "assistant", content: "" },
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [...otherMessages, { ...lastMessage, content: lastMessage.content + text }];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box gap={"10px"}>
      <AppBar position="fixed" style={{ background: "black" }}>
        <Box
          height={"fit-content"}
          width={"100%"}
          justifyContent={"space-around"}
          display={"flex"}
          alignItems={"center"}
          p={2}
        >
          <Typography variant="h3">ChatBot</Typography>
          <Button onClick={() => setIsChatOpen(true)} color="inherit" spacing="2px">
            <ChatIcon fontSize="small"/>
            <Typography variant="h6">&nbsp;Chat Now</Typography>
          </Button>
        </Box>
      </AppBar>

      <Dialog open={isChatOpen} onClose={() => setIsChatOpen(false)} maxWidth="sm" fullWidth p={2} >
        <Box
          margin={"2px"}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Stack
            direction="column"
            width="100%"
            height="500px"
            borderRadius={8}
            p={2}
            spacing={3}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow={"auto"}
              maxHeight={"100%"}
              sx={{
                overflowY: "scroll",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display={"flex"}
                  justifyContent={message.role === "assistant" ? "flex-end" : "flex-start"}
                >
                  <Box
                    p={2}
                    paddingLeft={message.role === "assistant" ? 3 : 2}
                    bgcolor={message.role === "assistant" ? "primary.main" : "secondary.main"}
                    borderRadius={10}
                    color={"white"}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction={"row"} display={"flex"} spacing={2}>
              <TextField
                label="message"
                fullWidth
                value={message}
                onChange={(mes) => setMessage(mes.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                  },
                }}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={sendMessage}  color={"primary"} type="submit"
              sx={{ borderRadius: 50 }}>
                <SendIcon />
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
