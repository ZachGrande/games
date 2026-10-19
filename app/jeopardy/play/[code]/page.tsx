import PlayerGame from "../../components/PlayerGame";

export default async function PlayPage(props: PageProps<"/jeopardy/play/[code]">) {
  const { code } = await props.params;
  return <PlayerGame code={code.toUpperCase()} />;
}
