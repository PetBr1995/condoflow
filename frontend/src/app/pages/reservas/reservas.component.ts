import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReservasService, AreaComum, Reserva, ReservaOcupada } from '../../services/reservas.service';
import { AuthService } from '../../services/auth.service';

export interface DiaCalendario {
  dataStr: string; // 'YYYY-MM-DD'
  diaNumero: number;
  isOutroMes: boolean;
  isPassado: boolean;
  isHoje: boolean;
  isTotalmenteOcupado: boolean;
  isParcialmenteOcupado: boolean;
  isDisponivel: boolean;
  isBloqueadoPeloSindico: boolean;
  isTotalmenteBloqueado: boolean;
  isParcialmenteBloqueado: boolean;
  motivoBloqueio?: string;
  periodosOcupados: string[];
}

export interface OpcaoPeriodo {
  id: string;
  nome: string;
  horario: string;
  icone: string;
  disponivel: boolean;
  motivoIndisponivel?: string;
  isBloqueadoPeloSindico?: boolean;
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent implements OnInit {
  areas: AreaComum[] = [];
  reservas: Reserva[] = [];
  reservasOcupadas: ReservaOcupada[] = [];
  filtroStatus: string = 'todas';

  // Formulário de Nova Reserva
  mostrarFormulario: boolean = false;
  areaSelecionadaId: number | null = null;
  dataReserva: string = '';
  periodoSelecionado: string = 'dia_inteiro';
  observacoes: string = '';

  // Gestão de Bloqueio / Indisponibilidade pelo Síndico
  mostrarPainelBloqueio: boolean = false;
  periodoBloqueio: string = 'dia_inteiro';
  motivoBloqueioInput: string = 'Manutenção / Limpeza';
  carregandoBloqueio: boolean = false;

  // Calendário interativo
  mesAtual: Date = new Date();
  diasCalendario: DiaCalendario[] = [];
  diasSemana: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Opções de períodos computadas para a data selecionada
  opcoesPeriodo: OpcaoPeriodo[] = [];

  carregando: boolean = false;
  carregandoDisponibilidade: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    public reservasService: ReservasService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    this.dataReserva = this.formatarDataIso(amanha);
    this.mesAtual = new Date(amanha.getFullYear(), amanha.getMonth(), 1);

    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.reservasService.getAreasComuns().subscribe({
      next: (areas) => {
        this.areas = areas;
        if (areas.length > 0 && !this.areaSelecionadaId) {
          this.areaSelecionadaId = areas[0].id;
        }
        if (this.areaSelecionadaId) {
          this.carregarDisponibilidade();
        }
      },
      error: (err) => console.error(err)
    });

    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.carregando = false;
      },
      error: (err) => {
        console.error(err);
        this.carregando = false;
      }
    });
  }

  aoMudarArea(): void {
    this.carregarDisponibilidade();
  }

  carregarDisponibilidade(): void {
    if (!this.areaSelecionadaId) return;

    this.carregandoDisponibilidade = true;
    this.reservasService.getDisponibilidade(this.areaSelecionadaId).subscribe({
      next: (ocupadas) => {
        this.reservasOcupadas = ocupadas;
        this.gerarCalendario();
        this.atualizarOpcoesPeriodo();
        this.carregandoDisponibilidade = false;
      },
      error: (err) => {
        console.error('Erro ao buscar disponibilidade:', err);
        this.carregandoDisponibilidade = false;
      }
    });
  }

  abrirFormularioParaEspaco(areaId: number): void {
    this.areaSelecionadaId = areaId;
    this.mostrarFormulario = true;
    this.carregarDisponibilidade();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- NAVEGAÇÃO DE CALENDÁRIO ---

  get mesAtualLabel(): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[this.mesAtual.getMonth()]} de ${this.mesAtual.getFullYear()}`;
  }

  get podeVoltarMes(): boolean {
    const hoje = new Date();
    const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return this.mesAtual > primeiroDiaMesAtual;
  }

  mesAnterior(): void {
    if (!this.podeVoltarMes) return;
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() - 1, 1);
    this.gerarCalendario();
  }

  proximoMes(): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + 1, 1);
    this.gerarCalendario();
  }

  gerarCalendario(): void {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeStr = this.formatarDataIso(hoje);

    const dias: DiaCalendario[] = [];

    // Preenche dias do mês anterior para completar primeira semana
    const diaSemanaInicio = primeiroDia.getDay(); // 0 (Dom) a 6 (Sáb)
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const diaNum = ultimoDiaMesAnterior - i;
      const data = new Date(ano, mes - 1, diaNum);
      dias.push(this.criarDiaCalendario(data, diaNum, true, hojeStr));
    }

    // Dias do mês atual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const data = new Date(ano, mes, d);
      dias.push(this.criarDiaCalendario(data, d, false, hojeStr));
    }

    // Preenche dias do próximo mês para completar grade (até 35 ou 42)
    const totalSlots = dias.length <= 35 ? 35 : 42;
    const diasRestantes = totalSlots - dias.length;
    for (let d = 1; d <= diasRestantes; d++) {
      const data = new Date(ano, mes + 1, d);
      dias.push(this.criarDiaCalendario(data, d, true, hojeStr));
    }

    this.diasCalendario = dias;
  }

  private criarDiaCalendario(data: Date, diaNum: number, isOutroMes: boolean, hojeStr: string): DiaCalendario {
    const dataStr = this.formatarDataIso(data);
    const isPassado = dataStr < hojeStr;
    const isHoje = dataStr === hojeStr;

    // Busca ocupações e bloqueios nesta data
    const reservasDoDia = this.reservasOcupadas.filter(r => r.data_reserva === dataStr);
    const periodosOcupados = reservasDoDia.map(r => r.periodo);
    
    const bloqueiosDoDia = reservasDoDia.filter(r => r.status === 'bloqueado');
    const isBloqueadoPeloSindico = bloqueiosDoDia.length > 0;
    const motivoBloqueio = isBloqueadoPeloSindico ? bloqueiosDoDia[0].motivo : undefined;

    const temDiaInteiro = periodosOcupados.includes('dia_inteiro');
    const todosTurnosOcupados = ['manha', 'tarde', 'noite'].every(p => periodosOcupados.includes(p));

    // Dia totalmente ocupado somente se 'dia_inteiro' foi escolhido ou todos os turnos estão cheios
    const isTotalmenteOcupado = temDiaInteiro || todosTurnosOcupados;
    const isParcialmenteOcupado = !isTotalmenteOcupado && periodosOcupados.length > 0;
    const isDisponivel = !isPassado && !isTotalmenteOcupado;

    const isTotalmenteBloqueado = bloqueiosDoDia.some(b => b.periodo === 'dia_inteiro') || (isBloqueadoPeloSindico && todosTurnosOcupados);
    const isParcialmenteBloqueado = isBloqueadoPeloSindico && !isTotalmenteBloqueado;

    return {
      dataStr,
      diaNumero: diaNum,
      isOutroMes,
      isPassado,
      isHoje,
      isTotalmenteOcupado,
      isParcialmenteOcupado,
      isDisponivel,
      isBloqueadoPeloSindico,
      isTotalmenteBloqueado,
      isParcialmenteBloqueado,
      motivoBloqueio,
      periodosOcupados
    };
  }

  selecionarDia(dia: DiaCalendario): void {
    if (dia.isPassado) {
      this.mensagemErro = 'Não é permitido selecionar datas que já passaram.';
      return;
    }

    // Para o morador comum, dias 100% ocupados ou bloqueados não são selecionáveis para reserva
    if (dia.isTotalmenteOcupado && !this.authService.isSindico) {
      const motivo = dia.motivoBloqueio ? ` (Motivo: ${dia.motivoBloqueio})` : '';
      this.mensagemErro = `A data ${this.formatarDataBr(dia.dataStr)} está indisponível para esta área comum${motivo}. Escolha outro dia.`;
      return;
    }

    this.mensagemErro = '';
    this.dataReserva = dia.dataStr;
    this.atualizarOpcoesPeriodo();
  }

  aoDigitarData(): void {
    this.mensagemErro = '';
    if (this.dataReserva) {
      const [ano, mes] = this.dataReserva.split('-').map(Number);
      if (ano && mes) {
        this.mesAtual = new Date(ano, mes - 1, 1);
        this.gerarCalendario();
      }
    }
    this.atualizarOpcoesPeriodo();
  }

  // --- ATUALIZAÇÃO E VALIDAÇÃO DOS PERÍODOS (HORÁRIOS) ---

  atualizarOpcoesPeriodo(): void {
    if (!this.dataReserva) {
      this.opcoesPeriodo = [];
      return;
    }

    const reservasNoDia = this.reservasOcupadas.filter(r => r.data_reserva === this.dataReserva);
    const periodosOcupados = reservasNoDia.map(r => r.periodo);
    const temDiaInteiro = periodosOcupados.includes('dia_inteiro');
    const temAlgumPeriodo = periodosOcupados.length > 0;

    const getBloqueio = (periodo: string) => reservasNoDia.find(r => r.periodo === periodo && r.status === 'bloqueado');
    const bloqueioDiaInteiro = getBloqueio('dia_inteiro');

    const opcoes: OpcaoPeriodo[] = [
      {
        id: 'dia_inteiro',
        nome: 'Dia Inteiro',
        horario: '08h às 22h',
        icone: 'wb_sunny',
        disponivel: !temDiaInteiro && !temAlgumPeriodo,
        motivoIndisponivel: bloqueioDiaInteiro
          ? `Bloqueado pela Administração: ${bloqueioDiaInteiro.motivo || 'Manutenção'}`
          : temDiaInteiro
            ? 'Já existe reserva de dia inteiro nesta data'
            : temAlgumPeriodo
              ? 'Indisponível: já existem turnos reservados nesta data (os demais turnos continuam livres)'
              : undefined,
        isBloqueadoPeloSindico: !!bloqueioDiaInteiro
      },
      {
        id: 'manha',
        nome: 'Manhã',
        horario: '08h às 13h',
        icone: 'light_mode',
        disponivel: !temDiaInteiro && !periodosOcupados.includes('manha'),
        motivoIndisponivel: bloqueioDiaInteiro
          ? `Bloqueado pela Administração: ${bloqueioDiaInteiro.motivo || 'Manutenção'}`
          : getBloqueio('manha')
            ? `Bloqueado pela Administração: ${getBloqueio('manha')?.motivo || 'Manutenção'}`
            : temDiaInteiro
              ? 'Dia inteiro já reservado'
              : periodosOcupados.includes('manha')
                ? 'Manhã já reservada (tarde e noite livres)'
                : undefined,
        isBloqueadoPeloSindico: !!bloqueioDiaInteiro || !!getBloqueio('manha')
      },
      {
        id: 'tarde',
        nome: 'Tarde',
        horario: '13h às 18h',
        icone: 'wb_twilight',
        disponivel: !temDiaInteiro && !periodosOcupados.includes('tarde'),
        motivoIndisponivel: bloqueioDiaInteiro
          ? `Bloqueado pela Administração: ${bloqueioDiaInteiro.motivo || 'Manutenção'}`
          : getBloqueio('tarde')
            ? `Bloqueado pela Administração: ${getBloqueio('tarde')?.motivo || 'Manutenção'}`
            : temDiaInteiro
              ? 'Dia inteiro já reservado'
              : periodosOcupados.includes('tarde')
                ? 'Tarde já reservada (demais turnos livres)'
                : undefined,
        isBloqueadoPeloSindico: !!bloqueioDiaInteiro || !!getBloqueio('tarde')
      },
      {
        id: 'noite',
        nome: 'Noite',
        horario: '18h às 23h',
        icone: 'dark_mode',
        disponivel: !temDiaInteiro && !periodosOcupados.includes('noite'),
        motivoIndisponivel: bloqueioDiaInteiro
          ? `Bloqueado pela Administração: ${bloqueioDiaInteiro.motivo || 'Manutenção'}`
          : getBloqueio('noite')
            ? `Bloqueado pela Administração: ${getBloqueio('noite')?.motivo || 'Manutenção'}`
            : temDiaInteiro
              ? 'Dia inteiro já reservado'
              : periodosOcupados.includes('noite')
                ? 'Noite já reservada (demais turnos livres)'
                : undefined,
        isBloqueadoPeloSindico: !!bloqueioDiaInteiro || !!getBloqueio('noite')
      }
    ];

    this.opcoesPeriodo = opcoes;

    // Se o período selecionado atualmente estiver indisponível, seleciona o primeiro disponível
    const periodoAtualValido = opcoes.find(o => o.id === this.periodoSelecionado && o.disponivel);
    if (!periodoAtualValido) {
      const primeiroDisponivel = opcoes.find(o => o.disponivel);
      if (primeiroDisponivel) {
        this.periodoSelecionado = primeiroDisponivel.id;
      }
    }
  }

  selecionarPeriodo(opcao: OpcaoPeriodo): void {
    if (!opcao.disponivel) {
      this.mensagemErro = `Horário ${opcao.nome} indisponível: ${opcao.motivoIndisponivel || 'Já reservado'}`;
      return;
    }
    this.mensagemErro = '';
    this.periodoSelecionado = opcao.id;
  }

  get temHorarioDisponivelNoDia(): boolean {
    return this.opcoesPeriodo.some(o => o.disponivel);
  }

  get periodoSelecionadoNome(): string {
    const map: Record<string, string> = {
      'dia_inteiro': 'Dia Inteiro (08h às 22h)',
      'manha': 'Manhã (08h às 13h)',
      'tarde': 'Tarde (13h às 18h)',
      'noite': 'Noite (18h às 23h)'
    };
    return map[this.periodoSelecionado] || this.periodoSelecionado;
  }

  // --- GESTÃO DE DISPONIBILIDADE PELO SÍNDICO ---

  get diaSelecionadoTemBloqueio(): boolean {
    return this.reservasOcupadas.some(
      r => r.data_reserva === this.dataReserva && r.status === 'bloqueado'
    );
  }

  get bloqueiosDoDiaSelecionado(): ReservaOcupada[] {
    return this.reservasOcupadas.filter(
      r => r.data_reserva === this.dataReserva && r.status === 'bloqueado'
    );
  }

  get motivoBloqueioDiaSelecionado(): string {
    const b = this.bloqueiosDoDiaSelecionado[0];
    return b ? `${b.motivo || 'Manutenção'} (${b.periodo === 'dia_inteiro' ? 'Dia Inteiro' : b.periodo})` : '';
  }

  bloquearDataSindico(): void {
    if (!this.areaSelecionadaId || !this.dataReserva) {
      this.mensagemErro = 'Selecione o espaço e a data para bloquear.';
      return;
    }

    this.carregandoBloqueio = true;
    this.reservasService.bloquearData(this.areaSelecionadaId, {
      data: this.dataReserva,
      periodo: this.periodoBloqueio,
      motivo: this.motivoBloqueioInput
    }).subscribe({
      next: () => {
        this.mensagemSucesso = `A data ${this.formatarDataBr(this.dataReserva)} foi marcada como INDISPONÍVEL (${this.periodoBloqueio}) pela administração com sucesso!`;
        this.mostrarPainelBloqueio = false;
        this.carregandoBloqueio = false;
        this.carregarDisponibilidade();
      },
      error: (err) => {
        this.mensagemErro = err.error?.erro || 'Erro ao bloquear data.';
        this.carregandoBloqueio = false;
      }
    });
  }

  desbloquearDataSindico(bloqueioId?: number): void {
    if (!this.areaSelecionadaId || !this.dataReserva) return;

    if (!confirm(`Deseja LIBERAR e tornar DISPONÍVEL a data ${this.formatarDataBr(this.dataReserva)} para reservas dos moradores?`)) {
      return;
    }

    this.carregandoBloqueio = true;
    this.reservasService.desbloquearData(this.areaSelecionadaId, {
      data: this.dataReserva,
      bloqueio_id: bloqueioId
    }).subscribe({
      next: () => {
        this.mensagemSucesso = `A data ${this.formatarDataBr(this.dataReserva)} foi liberada e agora está DISPONÍVEL para os moradores!`;
        this.carregandoBloqueio = false;
        this.carregarDisponibilidade();
      },
      error: (err) => {
        this.mensagemErro = err.error?.erro || 'Erro ao desbloquear data.';
        this.carregandoBloqueio = false;
      }
    });
  }

  // --- SUBMISSÃO DE RESERVA ---

  solicitarReserva(): void {
    if (!this.areaSelecionadaId || !this.dataReserva) {
      this.mensagemErro = 'Selecione o espaço e a data desejada.';
      return;
    }

    if (!this.temHorarioDisponivelNoDia) {
      this.mensagemErro = 'Não há horários disponíveis para a data selecionada. Escolha outro dia.';
      return;
    }

    const opcao = this.opcoesPeriodo.find(o => o.id === this.periodoSelecionado);
    if (!opcao || !opcao.disponivel) {
      this.mensagemErro = 'O horário selecionado não está mais disponível. Escolha outro horário.';
      return;
    }

    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.reservasService.solicitarReserva({
      area_comum: this.areaSelecionadaId,
      data_reserva: this.dataReserva,
      periodo: this.periodoSelecionado,
      observacoes: this.observacoes
    }).subscribe({
      next: (reserva) => {
        this.mensagemSucesso = `Reserva solicitada com sucesso para ${reserva.area_nome} em ${this.formatarDataBr(this.dataReserva)} (${reserva.periodo_display})! Este dia e horário foram marcados como reservados.`;
        this.observacoes = '';
        this.carregarDisponibilidade();
        this.carregarDados();
      },
      error: (err) => {
        const erroMsg = err.error?.data_reserva?.[0] || err.error?.detail || err.error?.non_field_errors?.[0] || 'Erro ao solicitar reserva.';
        this.mensagemErro = erroMsg;
        this.carregarDisponibilidade();
      }
    });
  }

  aprovar(id: number): void {
    this.reservasService.aprovarReserva(id).subscribe({
      next: () => {
        this.carregarDisponibilidade();
        this.carregarDados();
      },
      error: () => alert('Erro ao aprovar reserva.')
    });
  }

  rejeitar(id: number): void {
    const motivo = prompt('Informe o motivo da rejeição (opcional):') || 'Data indisponível';
    this.reservasService.rejeitarReserva(id, motivo).subscribe({
      next: () => {
        this.carregarDisponibilidade();
        this.carregarDados();
      },
      error: () => alert('Erro ao rejeitar reserva.')
    });
  }

  cancelar(id: number): void {
    if (confirm('Tem certeza de que deseja cancelar esta reserva?')) {
      this.reservasService.cancelarReserva(id).subscribe({
        next: () => {
          this.carregarDisponibilidade();
          this.carregarDados();
        },
        error: () => alert('Erro ao cancelar reserva.')
      });
    }
  }

  reservasFiltradas(): Reserva[] {
    if (this.filtroStatus === 'todas') return this.reservas;
    return this.reservas.filter(r => r.status === this.filtroStatus);
  }

  get areaSelecionadaNome(): string {
    const a = this.areas.find(area => area.id === this.areaSelecionadaId);
    return a ? a.nome : 'Espaço Selecionado';
  }

  // --- HELPERS DE FORMATAÇÃO ---

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  formatarDataBr(dataIso: string): string {
    if (!dataIso) return '';
    const partes = dataIso.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataIso;
  }
}
