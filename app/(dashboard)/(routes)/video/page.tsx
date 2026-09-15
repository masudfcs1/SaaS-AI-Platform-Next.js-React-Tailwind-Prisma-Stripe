"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Heading from "@/components/heading";
import { useForm } from "react-hook-form";
import { VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { formSchema } from "./constants";
import { Button } from "@/components/ui/button";

const VideoPage = () => {
  const [video, setVideo] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setVideo(undefined);
      // Placeholder: in a real app, this calls a video generation API (e.g. Replicate)
      console.log("Video generation prompt:", values.prompt);
      form.reset();
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div>
      <Heading
        title="Video Generation"
        description="Turn your prompt into video."
        icon={VideoIcon}
        iconColor="text-orange-500"
        bgColor="bg-orange-500/10"
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
                        placeholder="Clownfish swimming around a coral reef"
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
              <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
          {!video && !isLoading && (
            <div className="text-center py-20">
              <VideoIcon className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No video generated yet.
              </p>
            </div>
          )}
          {video && (
            <video
              controls
              className="w-full aspect-video mt-8 rounded-lg border border-zinc-200 dark:border-white/10 bg-black"
            >
              <source src={video} />
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
