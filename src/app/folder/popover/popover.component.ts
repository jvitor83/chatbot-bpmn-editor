import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.css']
})
export class PopoverComponent implements OnInit {

  estrategia: 'um-caminho-por-intencao' | 'caminho-completo-dividido-por-decisao' | 'caminho-completo-sem-divisao' = null;

  constructor(private popoverController: PopoverController) { }

  ngOnInit(): void {
    this.estrategia = localStorage.getItem('estrategia') as any;
    if (this.estrategia == null) {
      this.estrategia = 'caminho-completo-dividido-por-decisao';
      localStorage.setItem('estrategia', this.estrategia);
    }
  }

  checkValue(value) {
    localStorage.setItem('estrategia', this.estrategia);
  }

  dismiss() {
    console.log('estrategia:', this.estrategia);
    this.popoverController.dismiss({ estrategia: this.estrategia });
  }

}
