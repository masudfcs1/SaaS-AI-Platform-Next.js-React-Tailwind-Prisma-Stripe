"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Heading from "@/components/heading";
import { useForm } from "react-hook-form";
import { Download, ImageIcon } from "lucide-react";
import React, { useState } from "react";
import { formSchema } from "./constants";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";

const ImagePage = () => {
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);
      // Placeholder: in a real app, this calls an image generation API
      console.log("Image generation prompt:", values.prompt);
      // Mock response for UI demonstration
      setImages([
        `https://placehold.co/512x512/6d28d9/ffffff?text=${encodeURIComponent(values.prompt.slice(0, 20))}`,
      ]);
      form.reset();
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-500"
        bgColor="bg-pink-500/10"
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
                        placeholder="A photo of a horse in Swiss alps"
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
              <div className="h-6 w-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
          {images.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <ImageIcon className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No images generated yet.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
            {images.map((src, index) => (
              <Card key={index} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10">
                <div className="relative aspect-square">
                  <img
                    alt="Generated"
                    src={src}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardFooter className="p-2">
                  <Button
                    onClick={() => window.open(src)}
                    variant="secondary"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
