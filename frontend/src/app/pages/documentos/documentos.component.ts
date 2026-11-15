import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DocumentosService, DocumentoCondominio } from '../../services/documentos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './documentos.component.html',
  styleUrl: './documentos.component.css'
})
export class DocumentosComponent implements OnInit {
  documentos: DocumentoCondominio[] = [];
  filtroCategoria: string = 'todas';
  mostrarFormulario: boolean = false;

  titulo: string = '';
  categoria: string = 'regimento';
  descricao: string = '';
  arquivoSelecionado: File | null = null;
  nomeArquivo: string = '';

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    public documentosService: DocumentosService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarDocumentos();
  }

  carregarDocumentos(): void {
    this.documentosService.getDocumentos().subscribe({
      next: (dados) => this.documentos = dados,
      error: () => this.mensagemErro = 'Erro ao carregar documentos oficiais.'
    });
  }

  documentosFiltrados(): DocumentoCondominio[] {
    if (this.filtroCategoria === 'todas') return this.documentos;
    return this.documentos.filter(d => d.categoria === this.filtroCategoria);
  }

  selecionarArquivo(input: HTMLInputElement): void {
    if (input.files && input.files[0]) {
      this.arquivoSelecionado = input.files[0];
      this.nomeArquivo = input.files[0].name;
    } else {
      this.arquivoSelecionado = null;
      this.nomeArquivo = '';
    }
  }

  fazerUpload(): void {
    if (!this.titulo.trim() || !this.arquivoSelecionado) {
      this.mensagemErro = 'Preencha o título e anexe o arquivo (PDF ou imagem).';
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.titulo.trim());
    formData.append('categoria', this.categoria);
    formData.append('descricao', this.descricao.trim());
    formData.append('arquivo', this.arquivoSelecionado);

    this.documentosService.enviarDocumento(formData).subscribe({
      next: () => {
        this.mensagemSucesso = 'Documento publicado com sucesso para todo o condomínio!';
        this.mostrarFormulario = false;
        this.titulo = '';
        this.descricao = '';
        this.arquivoSelecionado = null;
        this.nomeArquivo = '';
        this.carregarDocumentos();
      },
      error: () => this.mensagemErro = 'Erro ao enviar documento.'
    });
  }

  excluir(id: number): void {
    if (confirm('Deseja excluir este documento?')) {
      this.documentosService.excluirDocumento(id).subscribe({
        next: () => this.carregarDocumentos(),
        error: () => alert('Erro ao excluir documento.')
      });
    }
  }
}
