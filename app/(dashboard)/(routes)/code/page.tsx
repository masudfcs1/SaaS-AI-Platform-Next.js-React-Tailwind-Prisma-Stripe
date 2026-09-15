"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Heading from "@/components/heading";
import { useForm } from "react-hook-form";
import { Code } from "lucide-react";
import React, { useState } from "react";
import { formSchema } from "./constants";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CodePage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/code", {
        messages: newMessages,
      });

      setMessages((current) => [...current, userMessage, response.data]);
      form.reset();
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Code Generation"
        description="Generate code using descriptive text."
        icon={Code}
        iconColor="text-green-500"
        bgColor="bg-green-500/10"
      />

      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border border-zinc-200 dark:border-white/10 w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2 bg-white dark:bg-white/[0.04]"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent bg-transparent dark:text-white"
                        disabled={isLoading}
                        placeholder="Simple toggle button using React hooks."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
                variant="premium"
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>

        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-zinc-100 dark:bg-white/[0.04]">
              <div className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <Code className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No code generated yet.
              </p>
            </div>
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 w-full flex items-start gap-x-4 rounded-lg",
                  message.role === "user"
                    ? "bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10"
                    : "bg-zinc-100 dark:bg-white/[0.08]"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-md flex-shrink-0",
                    message.role === "user"
                      ? "bg-purple-500/10"
                      : "bg-green-500/10"
                  )}
                >
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {message.role === "user" ? "U" : "AI"}
                  </span>
                </div>
                <div className="text-sm leading-7 text-zinc-900 dark:text-white overflow-hidden w-full">
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-zinc-900 dark:bg-black/40 text-green-400 p-4 rounded-lg overflow-x-auto">
                    {message.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePage;
