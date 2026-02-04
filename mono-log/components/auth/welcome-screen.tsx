"use client";

import { Github, Twitter } from "lucide-react";

import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { texts } from "@/lib/texts";

export function WelcomeScreen() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 animate-in fade-in">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold leading-9">
          {texts.welcome.headline}
        </h1>
        <LoginButton />
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold">{texts.welcome.aboutTitle}</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {texts.welcome.aboutBody}
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold">
          {texts.welcome.disclaimerTitle}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {texts.welcome.disclaimerBody}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="sr-only">{texts.welcome.linksTitle}</h2>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/kouichi-hoshi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center justify-center rounded-full border p-2 text-muted-foreground transition hover:text-foreground"
          >
            <Github className="size-4" />
          </a>
          <a
            href="https://x.com/stella_d_tweet"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="inline-flex items-center justify-center rounded-full border p-2 text-muted-foreground transition hover:text-foreground"
          >
            <Twitter className="size-4" />
          </a>
          <Button asChild variant="outline" size="sm">
            <a
              href="https://stella-d.net/#contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              {texts.welcome.contact}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

