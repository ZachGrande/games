"use client";

import { QRCodeSVG } from "qrcode.react";
import { useHostGame } from "./HostGameContext";

export default function AnswerKeyQr() {
  const { code } = useHostGame();
  const keyUrl = `${window.location.origin}/jeopardy/host/${code}/key`;

  return (
    <section className="flex items-center gap-4 rounded-xl bg-blue-900 p-4">
      <div className="rounded-lg bg-white p-2">
        <QRCodeSVG value={keyUrl} size={96} />
      </div>
      <p className="text-sm text-blue-100">
        <span className="font-semibold text-white">Answer key on your phone:</span> scan this while signed in to the
        same Google account to see the current response privately. Only you can open it.
      </p>
    </section>
  );
}
