import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AvisosService, Aviso } from '../../services/avisos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './avisos.component.html',
  styleUrl: './avisos.component.css'
})
export class AvisosComponent implements OnInit {
  avisos: Aviso[] = [];
  mostrarFormulario: boolean = false;
  
  tituloAviso: string = '';
  conteudoAviso: string = '';
  isImportante: boolean = false;

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    public avisosService: AvisosService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarAvisos();
  }

  carregarAvisos(): void {
    this.avisosService.getAvisos().subscribe({
      next: (dados) => this.avisos = dados,
      error: () => this.mensagemErro = 'Erro ao carregar comunicados.'
    });
  }

  publicarAviso(): void {
    if (!this.tituloAviso.trim() || !this.conteudoAviso.trim()) {
      this.mensagemErro = 'Preencha o título e o conteúdo do comunicado.';
      return;
    }

    this.avisosService.criarAviso({
      titulo: this.tituloAviso.trim(),
      conteudo: this.conteudoAviso.trim(),
      is_importante: this.isImportante
    }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Comunicado publicado com sucesso para todo o condomínio!';
        this.mostrarFormulario = false;
        this.tituloAviso = '';
        this.conteudoAviso = '';
        this.isImportante = false;
        this.carregarAvisos();
      },
      error: () => this.mensagemErro = 'Erro ao publicar comunicado.'
    });
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente remover este comunicado?')) {
      this.avisosService.excluirAviso(id).subscribe({
        next: () => this.carregarAvisos(),
        error: () => alert('Erro ao excluir comunicado.')
      });
    }
  }
}
