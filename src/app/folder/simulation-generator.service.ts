import { Injectable } from '@angular/core';
import { FlowElement, FlowNode, SequenceFlow, StartEvent } from 'bpmn-moddle';


@Injectable({
  providedIn: 'root'
})
export class SimulationGeneratorService {

  constructor() { }

  generate(startEvent: StartEvent): Array<FlowNode[]> {
    const caminhos = [] as Array<FlowNode[]>;

    const caminho = [] as FlowNode[];
    caminhos.push(caminho);

    caminho.push(startEvent);
    this.recursiveElement(startEvent, caminho, caminhos);
    // if (elementoDeDestino) {
    //   if (elementoDeDestino.$type === 'bpmn:Task') {
    //     caminho.push(elementoDeDestino); // adiciono na lista como o primeiro item
    //   } else if (elementoDeDestino.$type === 'bpmn:ExclusiveGateway') {
    //     const possuiNome = (elementoDeDestino.name != null && elementoDeDestino.name.trim() !== '');
    //     const possuiMaisDeUmaSaida = elementoDeDestino.outgoing && elementoDeDestino.outgoing.length > 1;
    //     if (possuiNome && possuiMaisDeUmaSaida) {
    //       // TODO: Adicionar tratativa para múltiplas
    //       caminho.push(elementoDeDestino);
    //     } else {

    //     }
    //   }
    // }


    // const tiposDeElementosSuportados = ['bpmn:ExclusiveGateway', 'bpmn:Activity', 'bpmn:Task'];
    // // Se existir destino e for de um dos tipos suportados
    // if (elementoDeDestino && tiposDeElementosSuportados.includes(elementoDeDestino.$type)) {
    //   if (elementoDeDestino.name && elementoDeDestino.outgoing.length > 1)
    //     retorno.push(elementoDeDestino); // adiciono na lista como o primeiro item

    // }

    // Limpo os caminhos sem final
    const caminhosParaRetornar = caminhos.filter(cam => {
      const ultimoElemento = cam[cam.length - 1];
      const caminhoPossuiElementoFinal = ultimoElemento.$type === 'bpmn:EndEvent';
      const caminhoPossuiGatewayComoElementoFinal = ultimoElemento.$type === 'bpmn:ExclusiveGateway';
      return caminhoPossuiElementoFinal || caminhoPossuiGatewayComoElementoFinal;
    });

    return caminhosParaRetornar;
  }

  private recursiveElement(elementoAtualCast: FlowElement, caminho: FlowElement[], caminhos: FlowElement[][]) {
    let elementoAtual: FlowNode = null;
    let clone: FlowElement[] = null;
    if ((elementoAtualCast as FlowNode).outgoing) {
      elementoAtual = elementoAtualCast as FlowNode;
    } else if ((elementoAtualCast as SequenceFlow).targetRef) {
      elementoAtual = (elementoAtualCast as SequenceFlow).targetRef;
      clone = this.adiciona(elementoAtual, caminho, caminhos);
    }
    if (elementoAtual && elementoAtual.outgoing && elementoAtual.outgoing.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < elementoAtual.outgoing.length; index++) {
        let proximoElemento: FlowElement = null;
        if (elementoAtual.$type === 'bpmn:ExclusiveGateway' || elementoAtual.$type === 'bpmn:StartEvent') {
          proximoElemento = elementoAtual.outgoing[index];
        } else {
          proximoElemento = elementoAtual.outgoing[index].targetRef;
        }
        this.adiciona(proximoElemento, caminho, caminhos, clone);
      }
    }
  }
  private adiciona(proximoElemento: FlowElement, caminho: FlowElement[], caminhos: FlowElement[][], clone?: FlowElement[]): FlowElement[] {
    let cloneDoCaminho = JSON.parse(JSON.stringify(caminho)) as FlowElement[];
    if (clone) {
      cloneDoCaminho = clone;
    }
    cloneDoCaminho.push(proximoElemento);

    // tslint:disable-next-line: max-line-length
    const apontaParaElementoAnterior: boolean = this.nextElementIsInPreviousElementOfPath(proximoElemento, caminho); // this.checkIfAlreadyHasThisPath(cloneDoCaminho, caminhos);
    const proximoElementoEUltimoSaoSequence = proximoElemento.$type === 'bpmn:SequenceFlow' && caminho[caminho.length - 1].$type === 'bpmn:SequenceFlow';
    if ((!apontaParaElementoAnterior) && (!proximoElementoEUltimoSaoSequence)) {
      caminhos.push(cloneDoCaminho);
      this.recursiveElement(proximoElemento, cloneDoCaminho, caminhos);
    }
    return cloneDoCaminho;
  }

  nextElementIsInPreviousElementOfPath(proximoElemento: FlowElement, caminho: FlowElement[]): boolean {
    const retorno = caminho.some(item => {
      const serializacao1 = JSON.stringify(proximoElemento);
      const serializacao2 = JSON.stringify(item);
      const valoresIguais = serializacao1 === serializacao2;
      return valoresIguais;
    });
    return retorno;
  }

  private checkIfAlreadyHasThisPath(cloneDoCaminho: FlowNode[], caminhos: FlowNode[][]): boolean {
    // const array1 = JSON.parse(JSON.stringify(cloneDoCaminho)) as FlowNode[];
    const possuiAlgumCaminhoComValoresIguais = caminhos.some(caminhoDaLista => {
      // const array2 = JSON.parse(JSON.stringify(caminhoDaLista)) as FlowNode[];
      const todosItensTemValoresIguais = cloneDoCaminho.every((value, index) => {
        const serializacao1 = JSON.stringify(value);
        const serializacao2 = JSON.stringify(caminhoDaLista[index]);
        const valoresIguais = serializacao1 === serializacao2;
        return valoresIguais;
      });
      return todosItensTemValoresIguais;
    });
    return possuiAlgumCaminhoComValoresIguais;
  }


}
