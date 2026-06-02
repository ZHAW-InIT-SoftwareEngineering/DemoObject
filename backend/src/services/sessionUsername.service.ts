import { generateUniqueAsync } from "unique-username-generator";
import { getSessionByUserName } from "../repositories";

const usernameAdjectives = [
  "Brave",
  "Bright",
  "Calm",
  "Clever",
  "Cosmic",
  "Curious",
  "Daring",
  "Glowing",
  "Lucky",
  "Swift",
  "Wise",
  "Zesty",
];

const usernameNouns = [
  "Comet",
  "Compass",
  "Falcon",
  "Lantern",
  "Meteor",
  "Nimbus",
  "Orbit",
  "Pixel",
  "Quest",
  "Rocket",
  "Signal",
  "Vertex",
];

export async function generateSessionUserName() {
  return generateUniqueAsync(
    {
      dictionaries: [usernameAdjectives, usernameNouns],
      separator: "",
      randomDigits: 2,
      style: "pascalCase",
    },
    async (candidate) => Boolean(await getSessionByUserName(candidate)),
  );
}
