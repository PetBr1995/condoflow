import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EnquetesService, Enquete } from '../../services/enquetes.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-enquetes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './enquetes.component.html',
  styleUrl: './enquetes.component.css'
})
export class EnquetesComponent implements OnInit {
  enquetes: Enquete[] = [];
  mostrarFormulario: boolean = false;

  titulo: string = '';
  descricao: string = '';
  dataLimite: string = '';
  opcao1: string = '';
  opcao2: string = '';
  opcao3: string = '';
  opcao4: string = '';

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    public enquetesService: EnquetesService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const daquiAUmSemana = new Date();
    daquiAUmSemana.setDate(daquiAUmSemana.getDate() + 7);
    this.dataLimite = daquiAUmSemana.toISOString().split('T')[0];
    this.carregarEnquetes();
  }

  carregarEnquetes(): void {
    this.enquetesService.getEnquetes().subscribe({
      next: (dados) => this.enquetes = dados,
      error: () => this.mensagemErro = 'Erro ao carregar votações.'
    });
  }

  criarVotacao(): void {
    if (!this.titulo.trim() || !this.opcao1.trim() || !this.opcao2.trim() || !this.dataLimite) {
      this.mensagemErro = 'Preencha o título, a data limite e pelo menos 2 opções de resposta.';
      return;
    }

    this.enquetesService.criarEnquete({
      titulo: this.titulo.trim(),
      descricao: this.descricao.trim(),
      data_limite: this.dataLimite,
      opcao_1: this.opcao1.trim(),
      opcao_2: this.opcao2.trim(),
      opcao_3: this.opcao3.trim(),
      opcao_4: this.opcao4.trim()
    }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Votação aberta com sucesso para todos os moradores!';
        this.mostrarFormulario = false;
        this.titulo = '';
        this.descricao = '';
        this.opcao1 = '';
        this.opcao2 = '';
        this.opcao3 = '';
        this.opcao4 = '';
        this.carregarEnquetes();
      },
      error: () => this.mensagemErro = 'Erro ao criar votação.'
    });
  }

  computarVoto(enqueteId: number, opcaoEscolhida: number): void {
    this.enquetesService.votar(enqueteId, opcaoEscolhida).subscribe({
      next: () => {
        this.mensagemSucesso = 'Voto computado com sucesso para a sua unidade!';
        this.carregarEnquetes();
      },
      error: (err) => {
        this.mensagemErro = err.error?.erro || 'Erro ao registrar voto.';
      }
    });
  }

  encerrar(id: number): void {
    if (confirm('Deseja encerrar esta votação agora? Novos votos não serão aceitos.')) {
      this.enquetesService.encerrarEnquete(id).subscribe({
        next: () => this.carregarEnquetes(),
        error: () => alert('Erro ao encerrar votação.')
      });
    }
  }

  calcularPorcentagem(votosOpcao: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((votosOpcao / total) * 100);
  }
}
