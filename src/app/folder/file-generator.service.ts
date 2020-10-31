import { Injectable } from '@angular/core';
import { Story, Utter, Intent, DialogFiles } from './dialog-generator.service';
import { safeDump } from 'js-yaml';
import * as json2md from 'json2md';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';


@Injectable({
  providedIn: 'root'
})
export class FileGeneratorService {
  private content: string = null;
  generate(files: DialogFiles) {


    const intentsString = this.generateIntents(files.intents);
    const uttersString = this.generateUtters(files.utters, files.intents);
    const storiesString = this.generateStories(files.stories);

    const zipFile: JSZip = new JSZip();
    const zip = zipFile
      .file('data/nlu.md', intentsString)
      .file('domain.yml', uttersString)
      .file('data/stories.md', storiesString);

    let promise: Promise<string | Uint8Array> = null;
    if (zip.support.uint8array) {
      promise = zip.generateAsync({ type: "uint8array" });
    } else {
      promise = zip.generateAsync({ type: "string" });
    }
    promise.then(content => {
      this.saveAs(content);
    });

    // this.saveAs(this.content);
  }
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
    // const blob = new Blob([resposta], { type: 'text/plain;charset=utf-8' });
    // saveAs(blob, 'stories.md');
    return resposta;
  }

  generateIntents(intents: Intent[]) {
    const stringMd = intents.map((intent) => {
      return [
        { h2: `intent:${intent.name}` },
        { ul: intent.items }
      ];
    });
    const resposta = json2md(stringMd);
    // const blob = new Blob([resposta], { type: 'text/plain;charset=utf-8' });
    // saveAs(blob, 'nlu.md');
    return resposta;
  }

  generateUtters(utters: Utter[], intents: Intent[]) {
    const objetoDasProps = {
      utter_fallback: [{ text: "Sorry, i couldnt understand what you meant! Please try again!" }]
    };
    utters.map(utter => {
      objetoDasProps[utter.name] = utter.items.map(i => ({ text: `${i}` }));
    });
    const objeto2 = {
      intents: intents.map(i => i.name),
      responses: objetoDasProps
    };
    const config = {
      session_config: {
        session_expiration_time: 60.0,
        carry_over_slots_to_new_session: true
      }
    };
    const objeto3 = Object.assign(objeto2, config);

    const resposta = safeDump(objeto3, {});
    // const blob = new Blob([resposta], { type: 'text/plain;charset=utf-8' });
    // saveAs(blob, 'domain.yml');
    return resposta;
  }

  async saveAs(content: string | Uint8Array) {
    if ((window as any).showSaveFilePicker) {
      const options = {
        types: [
          {
            description: 'ZIP File',
            accept: {
              'application/zip': ['.zip'],
            },
          },
        ],
      };
      const handle = await (window as any).showSaveFilePicker(options);
      const writable = await handle.createWritable();
      // Write the contents of the file to the stream.
      await writable.write(content);
      // Close the file and write the contents to disk.
      await writable.close();

    } else {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `bpmn-chatbot-${new Date().toISOString().split(':').join('').split('-').join('').split('.').join('').split('Z').join('')}.zip`);

    }
  }

  constructor() { }
}
