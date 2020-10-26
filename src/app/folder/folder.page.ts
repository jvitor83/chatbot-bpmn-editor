import { SimulationGeneratorService } from './simulation-generator.service';
import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js';
import { parse } from 'fast-xml-parser';
// import { BPMNModdle, BPMNModdleConstructor, *asBpmnModdle } from 'bpmn-moddle';
import BPMNModdle, { Definitions, ElementType, FlowNode, Process, StartEvent } from 'bpmn-moddle';
import { saveAs } from 'file-saver';
import { AlertController } from '@ionic/angular';





import { Observable } from 'rxjs';
import PalleteProvider from './pallete-provider';
import PalleteProviderModule from './pallete-provider-module';
import Modeler from 'bpmn-js/lib/Modeler';
import { ViewerOptions } from 'diagram-js/lib/model';
import { DJSModule } from 'diagram-js';
import { AnswerUtter, Dialog, QuestionIntent } from '../dialog.service';
import { DialogConverterService } from './dialog-converter.service';
import { DialogGeneratorService } from './dialog-generator.service';
import { FileGeneratorService } from './file-generator.service';


// export interface Collaboration {
//   participant: string;
// }

// export interface Lane {
//   flowNodeRef: string[];
// }

// export interface LaneSet {
//   lane: Lane;
// }

// export interface Task {
//   id: string;
//   name: string;
//   type?: ElementType;
//   incoming: Array<string> | string;
//   outgoing: Array<string> | string;
// }

// export interface StartEvent {
//   outgoing: string;
// }

// export interface EndEvent {
//   incoming: string;
// }

// export interface BpmndiBPMNLabel {
//   'omgdc:Bounds': string;
// }

// export interface BpmndiBPMNShape {
//   'omgdc:Bounds': string;
//   'bpmndi:BPMNLabel': BpmndiBPMNLabel;
// }

// export interface BpmndiBPMNLabel2 {
//   'omgdc:Bounds': string;
// }

// export interface BpmndiBPMNEdge {
//   'omgdi:waypoint': string[];
//   'bpmndi:BPMNLabel': BpmndiBPMNLabel2;
// }

// export interface BpmndiBPMNPlane {
//   'bpmndi:BPMNShape': BpmndiBPMNShape[];
//   'bpmndi:BPMNEdge': BpmndiBPMNEdge[];
// }

// export interface BpmndiBPMNLabelStyle {
//   'omgdc:Font': string;
// }

// export interface BpmndiBPMNDiagram {
//   'bpmndi:BPMNPlane': BpmndiBPMNPlane;
//   'bpmndi:BPMNLabelStyle': BpmndiBPMNLabelStyle[];
// }

// // export interface Definitions {
// //   collaboration: Collaboration;
// //   process: Process;
// //   'bpmndi:BPMNDiagram': BpmndiBPMNDiagram;
// // }

// export interface BpmnObject {
//   // definitions: Definitions;
// }

// // export interface Process {
// //   extensionElements: string;
// //   laneSet: LaneSet;
// //   task: Task[];
// //   startEvent: StartEvent[] | StartEvent;
// //   endEvent: EndEvent[] | StartEvent;
// //   exclusiveGateway: Task[];
// //   sequenceFlow: string[];
// // }

// export const ElementType = {
//   startEvent: 'startEvent',
//   endEvent: 'endEvent',
//   exclusiveGateway: 'exclusiveGateway',
//   task: 'task',
//   unknown: 'unknown'
// } as const;
// export type ElementType = typeof ElementType[keyof typeof ElementType]; // 'r' | 'w' | 'x'


export const importDiagram = (bpmnJS) => <Object>(source: Observable<string>) =>
  new Observable<string>(observer => {

    const subscription = source.subscribe({
      next(xml: string) {

        // canceling the subscription as we are interested
        // in the first diagram to display only
        subscription.unsubscribe();

        bpmnJS.importXML(xml, function (err, warnings) {

          if (err) {
            observer.error(err);
          } else {
            observer.next(warnings);
          }

          observer.complete();
        });
      },
      error(e) {
        console.log('ERROR');
        observer.error(e);
      },
      complete() {
        observer.complete();
      }
    });
  });



@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styles: [
    `
      .diagram-container {
        height: 100%;
        width: 100%;
      }
    `
  ]
})
export class FolderPage implements OnInit, AfterContentInit, OnChanges, OnDestroy {
  private bpmnJS: Modeler;
  @ViewChild('ref', { static: true }) private el: ElementRef;


  public folder: string;

  @Output() private importDone: EventEmitter<any> = new EventEmitter();

  @Input() private url: string;


  constructor(private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private simulationService: SimulationGeneratorService,
    private dialogConverterService: DialogConverterService,
    private dialogGeneratorService: DialogGeneratorService,
    private fileGeneratorService: FileGeneratorService,
    private alertController: AlertController,
  ) {
    this.bpmnJS = new Modeler({ additionalModules: [PalleteProviderModule as DJSModule] } as ViewerOptions);

    this.bpmnJS.on('import.done', ({ error }) => {
      if (!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });
  }
  
  
 presentAlert(error) {
    const alert = this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      message: error,
      buttons: ['OK']
    });

    alert.then(e => e.present());
  }
  

  ngOnInit() {
    this.new();
    // this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    // this.loadUrl('https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn');
  }


  ngAfterContentInit(): void {
    // attach BpmnJS instance to DOM element
    this.bpmnJS.attachTo(this.el.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges) {
    // // re-import whenever the url changes
    // if (changes.url) {
    //   this.loadUrl(changes.url.currentValue);
    // }
  }

  ngOnDestroy(): void {
    // destroy BpmnJS instance
    this.bpmnJS.destroy();

    // this.viewer.attachTo(this.el.nativeElement);
  }

  new() {
    this.bpmnJS.createDiagram(() => {
      
    });
  }

  dispFile(contents) {
    this.bpmnJS.importXML(contents, (err, warnings) => {

    });
  }
  clickElem(elem) {
    // Thx user1601638 on Stack Overflow (6/6/2018 - https://stackoverflow.com/questions/13405129/javascript-create-and-save-file )
    let eventMouse = document.createEvent('MouseEvents');
    eventMouse.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    elem.dispatchEvent(eventMouse);
  }
  openFile(func) {
    const readFile = (e) => {
      let file = e.target.files[0];
      if (!file) {
        return;
      }
      let reader = new FileReader();
      reader.onload = (e) => {
        let contents = e.target.result;
        ((fileInput as any).func as Function).apply(this, [contents]);
        document.body.removeChild(fileInput);
      };
      reader.readAsText(file);
    };
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.onchange = readFile;
    (fileInput as any).func = func;
    document.body.appendChild(fileInput);
    this.clickElem(fileInput);
  }


  save() {
    this.bpmnJS.saveXML({ format: true, preamble: true }, (err, resultXmlString) => {
      const xml = resultXmlString as any as string;
      const blob = new Blob([xml], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `bpmn-chatbot-${new Date().toISOString().split(':').join('').split('-').join('').split('.').join('').split('Z').join('')}.xml`);
    });
  }

  async export() {

    this.bpmnJS.saveXML({ format: true, preamble: true }, (err, resultXmlString) => {
      const imagem = resultXmlString as any as string;
      console.log(imagem);
      const moddle = new BPMNModdle();
      console.log(moddle.fromXML);
      if (!imagem) {
        this.presentAlert('No file or result content!');
      }
      const promiseFromXML = (moddle as any).fromXML(imagem) as any as Promise<{ rootElement: Definitions }>;
      promiseFromXML.then((val => {
        console.log('definitions', val);
        const process = val.rootElement.rootElements.filter(e => e.$type === 'bpmn:Process')[0] as Process;
        const startEvent = process.flowElements.filter(e => e.$type === 'bpmn:StartEvent')[0] as StartEvent;


        const elementsArray: Array<FlowNode[]> = this.simulationService.generate(startEvent);
        // Para cada caminho devo então gerar os dialogos

        const array = Array.from(new Set(elementsArray.map((e) => JSON.stringify(e))) as any, (a, b) => JSON.parse(a as string));
        const dialogos = array.map(caminho => {
          const dialogo: Dialog = this.dialogConverterService.convert(caminho);
          return dialogo;
        });

        console.log('simulacoes', dialogos);

        const files = this.dialogGeneratorService.generate(dialogos);
        console.log('files', files);


        this.fileGeneratorService.generateIntents(files.intents);
        this.fileGeneratorService.generateUtters(files.utters, files.intents);
        this.fileGeneratorService.generateStories(files.stories);

      })
      ).catch(e => {
        this.presentAlert(JSON.stringify(e));
      });


      // const resultJsObj = parse(imagem, { parseAttributeValue: true, ignoreAttributes: false, attributeNamePrefix: '' }) as BpmnObject;

      // console.log(JSON.stringify(resultJsObj.definitions.process));
      // console.log(resultJsObj.definitions);

      // console.log(resultJsObj.definitions.process);


      // const process = resultJsObj.definitions.process;

      // const dialog: Dialog = this.convertProcessoToDialog(process);
    });
  }

  // private convertProcessoToDialog(process: Process): Dialog {
  //   let questions: Array<Question> = [];

  //   let startEvent: StartEvent = null;
  //   if (process.startEvent) {
  //     if (Array.isArray(process.startEvent)) {
  //       if (process.startEvent.length === 1) {
  //         startEvent = process.startEvent[0];
  //       }
  //     } else {
  //       startEvent = process.startEvent;
  //     }
  //   }

  //   if (startEvent) {
  //     let question = {} as Question;
  //     const primeiroElemento = startEvent;
  //     console.log('primeiro', primeiroElemento);
  //     const segundoElemento = this.getIdentifierById(primeiroElemento.outgoing, process);
  //     if (segundoElemento.type === ElementType.task) {
  //       const answer = { id: segundoElemento.id, description: segundoElemento.name } as Answer;
  //     } else if (segundoElemento.type === ElementType.exclusiveGateway) {
  //       const question = { id: segundoElemento.id, description: segundoElemento.name } as Question;
  //     }

  //     console.log('segundo', segundoElemento);
  //     const terceiroElemento = this.getIdentifierById(segundoElemento.outgoing as string, process);
  //     console.log('terceiro', terceiroElemento);
  //   }

  //   const dialog: Dialog = { id: this.folder, name: this.folder, questions };
  //   return dialog;
  // }

  // private getIdentifierById(id: string, process: Process): Task {
  //   // const arrayElements = [];
  //   // const arrayOfElements = arrayElements.concat(process.exclusiveGateway, process.task) as Task[];
  //   const exclusiveGateway = this.getElementById(id, process.exclusiveGateway, ElementType.exclusiveGateway);
  //   if (exclusiveGateway) {
  //     return exclusiveGateway;
  //   }
  //   const task = this.getElementById(id, process.task, ElementType.task);
  //   if (task) {
  //     return task;
  //   }
  //   // const endEvent = this.getElementById(id, process.endEvent, ElementType.endEvent);
  //   // if (endEvent) {
  //   //   return endEvent;
  //   // }
  //   // const startEvent = this.getElementById(id, process.startEvent, ElementType.startEvent);
  //   // if (startEvent) {
  //   //   return startEvent;
  //   // }
  //   return null;
  // }

  // private getElementById(id: string, sourceArray: Task[], elementType: ElementType = ElementType.unknown): Task {
  //   const taskArray = sourceArray.filter(element => {

  //     if (Array.isArray(element.incoming)) {
  //       const retorno = element.incoming.filter(inc => inc === id);
  //       if (retorno != null && retorno.length > 0) {
  //         return retorno[0];
  //       }
  //     } else if (element.incoming === id) {
  //       return element.incoming;
  //     }

  //   });
  //   if (taskArray != null && taskArray.length > 0) {
  //     taskArray[0].type = elementType;
  //     return taskArray[0];
  //   } else {
  //     console.error('Não encontrou o elemento!');
  //   }
  // }

  // loadUrl(url: string) {

  //   return (
  //     this.http.get(url, { responseType: 'text' }).pipe(
  //       // catchError(err => throwError(err)),
  //       importDiagram(this.bpmnJS)
  //     ).subscribe(
  //       (warnings) => {
  //         this.importDone.emit({
  //           type: 'success',
  //           warnings
  //         });
  //       },
  //       (err) => {
  //         this.importDone.emit({
  //           type: 'error',
  //           error: err
  //         });
  //       }
  //     )
  //   );
  // }


}
