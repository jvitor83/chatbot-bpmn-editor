import { Injectable } from '@angular/core';
import { Story, Utter, Intent } from './dialog-generator.service';
import { safeDump } from 'js-yaml';
import * as json2md from 'json2md';
import { saveAs } from 'file-saver';


@Injectable({
  providedIn: 'root'
})
export class FileGeneratorService {
  generateStories(stories: Story[]) {

    const stringMd = stories.map(storie => {
      return [
        { h2: storie.name },
        // { ul: ['intent', { ul: ['utter1', 'utter2'] }] }
        {
          ul_star: storie.path.map(caminho => ([caminho.intent.name, { ul: caminho.utters.map(u => (u.name)) }]))
        }
      ];
    });

    let indent = (content, spaces, ignoreFirst) => {
      let lines = content

      if (typeof content === "string") {
        lines = content.split("\n")
      }

      if (ignoreFirst) {
        if (lines.length <= 1) {
          return lines.join("\n")
        }
        return lines[0] + "\n" + indent(lines.slice(1), spaces, false)
      }

      return lines.map(c => " ".repeat(spaces) + c).join("\n")
    }

    let parseTextFormat = text => {

      let formats = {
        strong: "**"
        , italic: "*"
      }

      return text
        .replace(/<\/?strong\>/gi, formats.strong)
        .replace(/<\/?bold\>/gi, formats.strong)
        .replace(/<\/?em\>/gi, formats.italic)
        .replace(/<\/?italic\>/gi, formats.italic)

    }

    json2md.converters.ul_star = (input, json2md) => {
      let c = ""
      for (let i = 0; i < input.length; ++i) {
        let marker = ""

        let type = Object.keys(input[i])[0]
        if (type !== "ul" && type !== "ol") {
          marker += "\n * "
        }

        c += marker + parseTextFormat(indent(json2md(input[i]), 4, true))
      }
      return c
    }

    const resposta = json2md(stringMd);
    const blob = new Blob([resposta], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'stories.md');

  }

  generateIntents(intents: Intent[]) {
    const stringMd = intents.map((intent) => {
      return [
        { h2: `intent:${intent.name}` },
        { ul: intent.items }
      ];
    });
    const resposta = json2md(stringMd);
    const blob = new Blob([resposta], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'nlu.md');
  }

  generateUtters(utters: Utter[], intents: Intent[]) {
    const objetoDasProps = {
      utter_fallback: "Sorry, i couldnt understand what you meant! Please try again!"
    };
    utters.map(utter => {
      objetoDasProps[utter.name] = utter.items.map(i => ({ text: `${i}` }));
    });
    const objeto2 = {
      intents: intents.map(i => i.name),
      responses: objetoDasProps
    };

    const resposta = safeDump(objeto2, {});
    const blob = new Blob([resposta], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'domain.yml');
  }

  constructor() { }
}
