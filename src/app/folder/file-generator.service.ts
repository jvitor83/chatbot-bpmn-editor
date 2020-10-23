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
          ul: storie.path.map(caminho => ([caminho.intent.name, { ul: caminho.utters.map(u => (u.name)) }]))
        }
      ];
    });

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
    const objetoDasProps = {};
    const objetoinner = utters.map(utter => {
      objetoDasProps[utter.name] = utter.items.map(i => ({ text: `${i}` }));
    });
    const objeto2 = {
      intents: intents.map(i => i.name),
      responses: objetoDasProps
    };

    const resposta = safeDump(objeto2, {  });
    const blob = new Blob([resposta], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'utters.yml');
  }

  constructor() { }
}
