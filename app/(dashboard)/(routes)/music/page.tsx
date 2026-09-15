"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Heading from "@/components/heading";
import { useForm } from "react-hook-form";
import { Music } from "lucide-react";
import React, { useState } from "react";
import { formSchema } from "./constants";
import { Button } from "@/components/ui/button";

const MusicPage = () => {
  const [music, setMusic] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic(undefined);
      // Placeholder: in a real app, this calls a music generation API (e.g. Replicate)
      console.log("Music generation prompt:", values.prompt);
      form.reset();
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div>
      <Heading
        title="Music Generation"
        description="Turn your prompt into music."
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
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
                        placeholder="Piano solo in C major"
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
            <div className="p-20">
              <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
          {!music && !isLoading && (
            <div className="text-center py-20">
              <Music className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No music generated yet.
              </p>
            </div>
          )}
          {music && (
            <audio controls className="w-full mt-8">
              <source src={music} />
            </audio>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
