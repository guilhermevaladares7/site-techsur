const config = {
  whatsapp: "5533988607882",
  instagram: "techsur_mg",
  horario: {
    dias: [1, 2, 3, 4, 5],
    abre: 8,
    fecha: 18
  },
  clientes: [
    { nome: "Cliente 1", instagram: "perfil_cliente_1", foto: "cliente-1" },
    { nome: "Cliente 2", instagram: "perfil_cliente_2", foto: "cliente-2" },
    { nome: "Cliente 3", instagram: "perfil_cliente_3", foto: "cliente-3" },
    { nome: "Cliente 4", instagram: "perfil_cliente_4", foto: "cliente-4" },
    { nome: "Cliente 5", instagram: "perfil_cliente_5", foto: "cliente-5" },
    { nome: "Cliente 6", instagram: "perfil_cliente_6", foto: "cliente-6" },
    { nome: "Cliente 7", instagram: "perfil_cliente_7", foto: "cliente-7" },
    { nome: "Cliente 8", instagram: "perfil_cliente_8", foto: "cliente-8" }
  ],
  depoimentos: [
    {
      texto: "Escreva aqui o depoimento do cliente, com as palavras dele. Duas ou três frases contando qual era o problema e como ficou depois do trabalho da Techsur TI.",
      nome: "Nome do cliente",
      cargo: "Cargo",
      empresa: "Empresa"
    }
  ]
};

const especialidades = {
  "servidores-nuvem": "Servidores em nuvem",
  "proxmox": "Virtualização com Proxmox",
  "pbs": "Backup com PBS",
  "backup-nuvem": "Backup em nuvem",
  "firewall": "Firewall",
  "bloqueio": "Bloqueio de sites",
  "vpn": "VPN corporativa",
  "loadbalance": "Load balance",
  "failover": "Failover",
  "mikrotik": "Soluções MikroTik"
};

const mapaNos = {
  remoto: { titulo: "Home office e filiais", texto: "Quem trabalha de casa, viaja ou está em outra unidade se conecta à empresa por um túnel criptografado. Para os sistemas, é como se a pessoa estivesse dentro do escritório.", relacionadas: ["vpn"] },
  nuvemserv: { titulo: "Servidores em nuvem", texto: "Sistemas, aplicações e arquivos podem rodar em servidores na nuvem, com flexibilidade para crescer e alta disponibilidade, acessados com segurança a partir da empresa.", relacionadas: ["servidores-nuvem", "vpn"] },
  internet: { titulo: "Dois links de internet", texto: "Ter dois links de operadoras diferentes é o primeiro passo para a empresa não ficar offline. No dia a dia eles dividem o tráfego; se um cair, o outro assume sozinho.", relacionadas: ["loadbalance", "failover"] },
  mikrotik: { titulo: "MikroTik", texto: "O centro da rede. Decide o que entra e sai pelo firewall, aplica as regras de navegação, recebe as conexões VPN, divide o tráfego entre os links e troca para o link reserva quando o principal cai.", relacionadas: ["mikrotik", "firewall", "bloqueio", "vpn", "loadbalance", "failover"] },
  equipe: { titulo: "Equipe", texto: "Os computadores da empresa navegam com regras definidas por setor, com sites e categorias liberados ou bloqueados e a rede interna separada da rede de visitantes.", relacionadas: ["bloqueio", "firewall"] },
  proxmox: { titulo: "Servidor Proxmox", texto: "Um único equipamento físico roda vários servidores virtuais isolados: o sistema de gestão, os arquivos, o banco de dados. Menos hardware para manter e mais facilidade para recuperar.", relacionadas: ["proxmox"] },
  pbs: { titulo: "Proxmox Backup Server", texto: "Copia as máquinas virtuais com deduplicação, guardando várias versões em pouco espaço. Permite restaurar uma VM inteira ou só um arquivo dela.", relacionadas: ["pbs"] },
  nuvembk: { titulo: "Backup em nuvem", texto: "Uma cópia de segurança fora da empresa, para quando o problema atinge o local inteiro: furto, incêndio, falha elétrica ou ataque que criptografa a rede.", relacionadas: ["backup-nuvem"] }
};

const mapaArestas = [
  { id: "vpn", de: "remoto", para: "internet", vpn: true },
  { id: "nuvem", de: "nuvemserv", para: "internet", vpn: true },
  { id: "link1", de: "internet", para: "mikrotik", curva: -1, rotulo: "Link 1" },
  { id: "link2", de: "internet", para: "mikrotik", curva: 1, rotulo: "Link 2" },
  { id: "equipe", de: "mikrotik", para: "equipe" },
  { id: "proxmox", de: "mikrotik", para: "proxmox" },
  { id: "pbs", de: "proxmox", para: "pbs", backup: true },
  { id: "nuvembk", de: "pbs", para: "nuvembk", backup: true }
];

const mapaModos = {
  normal: {
    texto: "No dia a dia, os dois links de internet trabalham juntos e o MikroTik divide o tráfego entre eles. O firewall filtra o que entra e sai, a equipe navega com as regras de cada setor e quem está fora acessa a empresa pela VPN.",
    fluxos: { vpn: 2, nuvem: 2, link1: 3, link2: 3, equipe: 3, proxmox: 3 },
    caidas: [],
    foco: [],
    status: {
      link1: ["ligado", "Online"],
      link2: ["ligado", "Online"],
      sistema: ["ligado", "No ar"],
      backup: ["ligado", "Programado"]
    }
  },
  queda: {
    texto: "O Link 1 caiu. O failover do MikroTik detectou a falha e passou todo o tráfego para o Link 2 automaticamente. A equipe, a VPN e os sistemas continuam funcionando, e quando o Link 1 voltar o balanceamento é retomado sozinho.",
    fluxos: { vpn: 2, nuvem: 2, link2: 5, equipe: 3, proxmox: 3 },
    caidas: ["link1"],
    foco: [],
    status: {
      link1: ["critico", "Fora do ar"],
      link2: ["ligado", "Com todo o tráfego"],
      sistema: ["ligado", "No ar"],
      backup: ["ligado", "Programado"]
    }
  },
  backup: {
    texto: "No horário programado, o Proxmox Backup Server copia as máquinas virtuais do servidor, guardando só o que mudou desde a última cópia. Depois, uma cópia segue para a nuvem, fora da empresa. Tudo acontece sem interromper o trabalho da equipe.",
    fluxos: { pbs: 4, nuvembk: 3 },
    caidas: [],
    foco: ["proxmox", "pbs", "nuvembk"],
    status: {
      link1: ["ligado", "Online"],
      link2: ["ligado", "Online"],
      sistema: ["ligado", "No ar"],
      backup: ["alerta", "Copiando 0%"]
    }
  }
};

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const svgNS = "http://www.w3.org/2000/svg";

function limitar(valor, minimo, maximo) {
  if (valor < minimo) {
    return minimo;
  } else if (valor > maximo) {
    return maximo;
  } else {
    return valor;
  }
}

function linkWhatsapp(mensagem) {
  return "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(mensagem);
}

function definirLinkWhatsapp(elemento, mensagem) {
  elemento.dataset.wa = mensagem;
  elemento.setAttribute("href", linkWhatsapp(mensagem));
  elemento.setAttribute("target", "_blank");
  elemento.setAttribute("rel", "noopener");
}

function prepararLinksWhatsapp() {
  document.querySelectorAll("[data-wa]").forEach(function (elemento) {
    definirLinkWhatsapp(elemento, elemento.dataset.wa);
  });
}

function abrirWhatsapp(mensagem) {
  const link = linkWhatsapp(mensagem);
  const janela = window.open(link, "_blank");
  if (janela) {
    janela.opener = null;
  } else {
    window.location.href = link;
  }
}

function formatarTelefone(numero) {
  const local = numero.slice(2);
  const ddd = local.slice(0, 2);
  const resto = local.slice(2);
  if (resto.length === 9) {
    return "(" + ddd + ") " + resto.slice(0, 5) + "-" + resto.slice(5);
  } else {
    return "(" + ddd + ") " + resto.slice(0, 4) + "-" + resto.slice(4);
  }
}

function descreverHorario() {
  const nomes = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const dias = config.horario.dias;
  let sequencial = true;
  for (let i = 1; i < dias.length; i++) {
    if (dias[i] !== dias[i - 1] + 1) {
      sequencial = false;
    }
  }
  let textoDias = "";
  if (dias.length > 1 && sequencial) {
    textoDias = nomes[dias[0]] + " a " + nomes[dias[dias.length - 1]];
  } else {
    textoDias = dias.map(function (dia) {
      return nomes[dia];
    }).join(", ");
  }
  textoDias = textoDias.charAt(0).toUpperCase() + textoDias.slice(1);
  return textoDias + ", das " + config.horario.abre + "h às " + config.horario.fecha + "h";
}

function preencherDados() {
  const urlInstagram = "https://www.instagram.com/" + config.instagram + "/";
  document.querySelectorAll("[data-instagram]").forEach(function (link) {
    link.setAttribute("href", urlInstagram);
  });
  document.querySelectorAll("[data-telefone]").forEach(function (elemento) {
    elemento.textContent = formatarTelefone(config.whatsapp);
  });
  document.querySelectorAll("[data-horario]").forEach(function (elemento) {
    elemento.textContent = descreverHorario();
  });
  document.querySelectorAll("[data-ano]").forEach(function (elemento) {
    elemento.textContent = String(new Date().getFullYear());
  });
}

function agoraEmSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const mapaDias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let dia = 0;
  let hora = 0;
  partes.forEach(function (parte) {
    if (parte.type === "weekday") {
      dia = mapaDias[parte.value];
    } else if (parte.type === "hour") {
      hora = parseInt(parte.value, 10);
    }
  });
  return { dia: dia, hora: hora };
}

function estaAberto() {
  const agora = agoraEmSaoPaulo();
  if (!config.horario.dias.includes(agora.dia)) {
    return false;
  }
  if (agora.hora >= config.horario.abre && agora.hora < config.horario.fecha) {
    return true;
  } else {
    return false;
  }
}

function atualizarStatus() {
  const aberto = estaAberto();
  document.querySelectorAll("[data-led-status]").forEach(function (led) {
    if (aberto) {
      led.classList.add("ligado");
    } else {
      led.classList.remove("ligado");
    }
  });
  document.querySelectorAll("[data-status-curto]").forEach(function (elemento) {
    if (aberto) {
      elemento.textContent = "Atendendo agora";
    } else {
      elemento.textContent = "Fora do horário";
    }
  });
  document.querySelectorAll("[data-status-longo]").forEach(function (elemento) {
    if (aberto) {
      elemento.textContent = "Atendimento aberto agora pelo WhatsApp.";
    } else {
      elemento.textContent = "Fora do horário agora. Mande sua mensagem e a resposta chega no próximo atendimento.";
    }
  });
}

let timerCarregando = null;

function mostrarCarregando(duracao) {
  const tela = document.getElementById("carregando");
  tela.classList.add("ativo");
  if (timerCarregando !== null) {
    window.clearTimeout(timerCarregando);
  }
  timerCarregando = window.setTimeout(esconderCarregando, duracao);
}

function esconderCarregando() {
  const tela = document.getElementById("carregando");
  tela.classList.remove("ativo");
  tela.classList.remove("inicial");
  timerCarregando = null;
}

function controlarCarregamento() {
  function finalizarInicial() {
    const espera = Math.max(0, 900 - performance.now());
    window.setTimeout(esconderCarregando, espera);
  }
  if (document.readyState === "complete") {
    finalizarInicial();
  } else {
    window.addEventListener("load", finalizarInicial);
  }
  document.addEventListener("click", function (evento) {
    const link = evento.target.closest("[data-wa]");
    if (link) {
      mostrarCarregando(1200);
    }
  });
  window.addEventListener("pageshow", function (evento) {
    if (evento.persisted) {
      esconderCarregando();
    }
  });
}

function controlarTopo() {
  const topo = document.getElementById("topo");
  const flutuante = document.querySelector(".wa-flutuante");
  const hero = document.getElementById("inicio");
  const contato = document.getElementById("contato");
  let noContato = false;

  function atualizar() {
    const posicao = window.scrollY;
    if (posicao > 24) {
      topo.classList.add("rolado");
    } else {
      topo.classList.remove("rolado");
    }
    const passouHero = posicao > hero.offsetHeight * 0.7;
    if (passouHero && !noContato) {
      flutuante.classList.add("visivel");
    } else {
      flutuante.classList.remove("visivel");
    }
  }

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        noContato = entrada.isIntersecting;
      });
      atualizar();
    }, { threshold: 0.15 });
    observador.observe(contato);
  }

  window.addEventListener("scroll", atualizar, { passive: true });
  atualizar();
}

function controlarMenu() {
  const topo = document.getElementById("topo");
  const botao = document.querySelector(".menu-botao");

  function definirAberto(aberto) {
    if (aberto) {
      topo.classList.add("menu-aberto");
      botao.setAttribute("aria-expanded", "true");
      botao.setAttribute("aria-label", "Fechar menu");
    } else {
      topo.classList.remove("menu-aberto");
      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-label", "Abrir menu");
    }
  }

  botao.addEventListener("click", function () {
    if (topo.classList.contains("menu-aberto")) {
      definirAberto(false);
    } else {
      definirAberto(true);
    }
  });

  document.querySelectorAll("#menu a").forEach(function (link) {
    link.addEventListener("click", function () {
      definirAberto(false);
    });
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      definirAberto(false);
    }
  });
}

function abrirEspecialidade(chave) {
  const cartao = document.getElementById("esp-" + chave);
  if (!cartao) {
    return;
  }
  let comportamento = "smooth";
  if (reduzirMovimento) {
    comportamento = "auto";
  }
  cartao.scrollIntoView({ behavior: comportamento, block: "center" });
  cartao.classList.add("realce");
  window.setTimeout(function () {
    cartao.classList.remove("realce");
  }, 2200);
}

function controlarPilares() {
  const pilares = document.getElementById("pilares");
  if (!pilares) {
    return;
  }
  if (!("IntersectionObserver" in window)) {
    pilares.classList.add("ligados");
    return;
  }
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        pilares.classList.add("ligados");
        observador.disconnect();
      }
    });
  }, { threshold: 0.45 });
  observador.observe(pilares);
}

function montarClientes() {
  const secao = document.getElementById("clientes");
  const grade = document.getElementById("clientes-grade");
  const blocoDepoimentos = document.getElementById("depoimentos");

  if (config.clientes.length === 0 && config.depoimentos.length === 0) {
    secao.hidden = true;
    document.querySelectorAll('a[href="#clientes"]').forEach(function (link) {
      link.hidden = true;
    });
    return;
  }

  if (config.clientes.length === 0) {
    grade.hidden = true;
  }

  config.clientes.forEach(function (cliente) {
    const item = document.createElement("li");
    item.className = "cliente";

    const moldura = document.createElement("div");
    moldura.className = "cliente-logo";
    const imagem = document.createElement("img");
    imagem.alt = cliente.nome;
    imagem.loading = "lazy";
    const pastaFotos = "imagens_clientes/";
    const tentativas = /\.(jpe?g|png|webp)$/i.test(cliente.foto || "")
      ? [pastaFotos + cliente.foto]
      : ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP"].map(function (extensao) {
          return pastaFotos + cliente.foto + "." + extensao;
        });
    let tentativa = 0;
    imagem.addEventListener("error", function () {
      tentativa++;
      if (cliente.foto && tentativa < tentativas.length) {
        imagem.src = tentativas[tentativa];
        return;
      }
      moldura.classList.add("sem-logo");
      moldura.textContent = cliente.nome;
    });
    if (cliente.foto) {
      imagem.src = tentativas[0];
    } else {
      imagem.dispatchEvent(new Event("error"));
    }
    moldura.appendChild(imagem);

    const info = document.createElement("div");
    info.className = "cliente-info";

    const legenda = document.createElement("p");
    legenda.className = "cliente-nome";
    legenda.textContent = cliente.nome;
    info.appendChild(legenda);

    if (cliente.instagram) {
      const usuario = cliente.instagram.replace(/^@/, "");
      const link = document.createElement("a");
      link.className = "cliente-instagram";
      link.href = "https://www.instagram.com/" + usuario + "/";
      link.target = "_blank";
      link.rel = "noopener";
      link.innerHTML = '<svg aria-hidden="true"><use href="#i-instagram"/></svg>';
      const texto = document.createElement("span");
      texto.textContent = "@" + usuario;
      link.appendChild(texto);
      info.appendChild(link);
    }

    item.appendChild(moldura);
    item.appendChild(info);
    grade.appendChild(item);
  });

  if (config.depoimentos.length === 0) {
    blocoDepoimentos.hidden = true;
  }

  config.depoimentos.forEach(function (depoimento) {
    const figura = document.createElement("figure");
    figura.className = "depoimento";

    const aspas = document.createElement("span");
    aspas.className = "depoimento-aspas";
    aspas.setAttribute("aria-hidden", "true");
    aspas.textContent = "“";

    const corpo = document.createElement("div");
    const citacao = document.createElement("blockquote");
    const texto = document.createElement("p");
    texto.textContent = depoimento.texto;
    citacao.appendChild(texto);

    const legenda = document.createElement("figcaption");
    const nome = document.createElement("strong");
    nome.textContent = depoimento.nome;
    legenda.appendChild(nome);
    let complemento = "";
    if (depoimento.cargo && depoimento.empresa) {
      complemento = depoimento.cargo + ", " + depoimento.empresa;
    } else if (depoimento.cargo) {
      complemento = depoimento.cargo;
    } else if (depoimento.empresa) {
      complemento = depoimento.empresa;
    }
    if (complemento !== "") {
      legenda.appendChild(document.createTextNode(complemento));
    }

    corpo.appendChild(citacao);
    corpo.appendChild(legenda);
    figura.appendChild(aspas);
    figura.appendChild(corpo);
    blocoDepoimentos.appendChild(figura);
  });
}

function controlarFormulario() {
  const formulario = document.getElementById("formulario");
  const campoNome = document.getElementById("f-nome");
  const blocoNome = document.getElementById("campo-nome");
  const erro = document.getElementById("f-erro");

  campoNome.addEventListener("input", function () {
    if (campoNome.value.trim() !== "") {
      blocoNome.classList.remove("invalido");
      erro.textContent = "";
    }
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const nome = campoNome.value.trim();
    const empresa = document.getElementById("f-empresa").value.trim();
    const cidade = document.getElementById("f-cidade").value.trim();
    const assunto = document.getElementById("f-assunto").value;
    const texto = document.getElementById("f-mensagem").value.trim();

    if (nome === "") {
      blocoNome.classList.add("invalido");
      erro.textContent = "Informe seu nome para abrir a conversa.";
      campoNome.focus();
      return;
    }

    let mensagem = "Olá! Meu nome é " + nome;
    if (empresa !== "") {
      mensagem = mensagem + ", da " + empresa;
    }
    if (cidade !== "") {
      mensagem = mensagem + " (" + cidade + ")";
    }
    mensagem = mensagem + ".\nAssunto: " + assunto;
    if (texto !== "") {
      mensagem = mensagem + "\n\n" + texto;
    }
    mostrarCarregando(1200);
    abrirWhatsapp(mensagem);
  });
}

function criarSvg(tag, atributos, pai) {
  const elemento = document.createElementNS(svgNS, tag);
  Object.keys(atributos).forEach(function (chave) {
    elemento.setAttribute(chave, atributos[chave]);
  });
  if (pai) {
    pai.appendChild(elemento);
  }
  return elemento;
}

function montarMapa() {
  const mapa = document.getElementById("mapa");
  const svg = document.getElementById("mapa-linhas");
  const textoModo = document.getElementById("modo-texto");
  const infoTitulo = document.getElementById("info-titulo");
  const infoTexto = document.getElementById("info-texto");
  const infoLinks = document.getElementById("info-links");
  const botoesModo = Array.from(document.querySelectorAll(".modo"));
  const elementosNos = {};
  const maxPacotes = 6;
  let modoAtual = "normal";
  let inicioModo = performance.now();
  let visivel = false;
  let rodando = false;
  let ultimoTextoBackup = "";

  document.querySelectorAll(".no").forEach(function (no) {
    elementosNos[no.dataset.no] = no;
  });

  const grupoLinhas = criarSvg("g", {}, svg);
  const grupoPacotes = criarSvg("g", {}, svg);
  const grupoRotulos = criarSvg("g", {}, svg);

  mapaArestas.forEach(function (aresta) {
    aresta.caminho = criarSvg("path", { class: "ml-linha" }, grupoLinhas);
    if (aresta.vpn) {
      aresta.caminho.classList.add("vpn");
    }
    aresta.pacotes = [];
    for (let i = 0; i < maxPacotes; i++) {
      let classe = "ml-pacote";
      if (aresta.backup) {
        classe = "ml-pacote backup";
      }
      const pacote = criarSvg("circle", { r: 3.6, class: classe, visibility: "hidden" }, grupoPacotes);
      aresta.pacotes.push(pacote);
    }
    if (aresta.rotulo) {
      aresta.textoRotulo = criarSvg("text", { class: "ml-rotulo" }, grupoRotulos);
      aresta.textoRotulo.textContent = aresta.rotulo;
    }
    aresta.marcaFalha = criarSvg("g", { class: "ml-falha" }, grupoRotulos);
    criarSvg("circle", { r: 11 }, aresta.marcaFalha);
    criarSvg("path", { d: "M-4 -4 L4 4 M4 -4 L-4 4" }, aresta.marcaFalha);
    aresta.comprimento = 0;
  });

  function caixa(id, base) {
    const r = elementosNos[id].getBoundingClientRect();
    return {
      esquerda: r.left - base.left,
      direita: r.right - base.left,
      topo: r.top - base.top,
      base: r.bottom - base.top,
      cx: (r.left + r.right) / 2 - base.left,
      cy: (r.top + r.bottom) / 2 - base.top
    };
  }

  function tracar(a, b, curva) {
    const vaoX = Math.max(b.esquerda - a.direita, a.esquerda - b.direita);
    const vaoY = Math.max(b.topo - a.base, a.topo - b.base);
    const desloc = curva * 12;
    const arco = curva * 34;
    if (vaoX >= vaoY * 0.9) {
      let sx = a.direita;
      let ex = b.esquerda;
      if (b.direita <= a.esquerda) {
        sx = a.esquerda;
        ex = b.direita;
      }
      const sy = limitar(b.cy, a.topo + 20, a.base - 20) + desloc;
      const ey = limitar(a.cy, b.topo + 20, b.base - 20) + desloc;
      let k = Math.max(28, Math.abs(ex - sx) * 0.5);
      if (ex < sx) {
        k = -k;
      }
      return { horizontal: true, d: "M" + sx + " " + sy + " C" + (sx + k) + " " + (sy + arco) + " " + (ex - k) + " " + (ey + arco) + " " + ex + " " + ey };
    } else {
      let sy = a.base;
      let ey = b.topo;
      if (b.base <= a.topo) {
        sy = a.topo;
        ey = b.base;
      }
      const sx = limitar(b.cx, a.esquerda + 24, a.direita - 24) + desloc;
      const ex = limitar(a.cx, b.esquerda + 24, b.direita - 24) + desloc;
      let k = Math.max(24, Math.abs(ey - sy) * 0.5);
      if (ey < sy) {
        k = -k;
      }
      return { horizontal: false, d: "M" + sx + " " + sy + " C" + (sx + arco) + " " + (sy + k) + " " + (ex + arco) + " " + (ey - k) + " " + ex + " " + ey };
    }
  }

  function calcularGeometria() {
    const base = mapa.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + base.width + " " + base.height);
    svg.setAttribute("width", String(base.width));
    svg.setAttribute("height", String(base.height));
    mapaArestas.forEach(function (aresta) {
      const curva = aresta.curva || 0;
      const resultado = tracar(caixa(aresta.de, base), caixa(aresta.para, base), curva);
      aresta.caminho.setAttribute("d", resultado.d);
      aresta.comprimento = aresta.caminho.getTotalLength();
      const meio = aresta.caminho.getPointAtLength(aresta.comprimento / 2);
      aresta.marcaFalha.setAttribute("transform", "translate(" + meio.x + " " + meio.y + ")");
      if (aresta.textoRotulo) {
        if (resultado.horizontal) {
          aresta.textoRotulo.setAttribute("x", String(meio.x));
          aresta.textoRotulo.setAttribute("y", String(meio.y + curva * 20 + 4));
          aresta.textoRotulo.setAttribute("text-anchor", "middle");
        } else {
          aresta.textoRotulo.setAttribute("x", String(meio.x + curva * 18));
          aresta.textoRotulo.setAttribute("y", String(meio.y + 4));
          if (curva < 0) {
            aresta.textoRotulo.setAttribute("text-anchor", "end");
          } else {
            aresta.textoRotulo.setAttribute("text-anchor", "start");
          }
        }
      }
    });
    desenharPacotes(performance.now());
  }

  function desenharPacotes(agora) {
    const modo = mapaModos[modoAtual];
    mapaArestas.forEach(function (aresta) {
      let quantidade = modo.fluxos[aresta.id] || 0;
      if (aresta.comprimento === 0) {
        quantidade = 0;
      }
      let velocidade = 0.085;
      if (aresta.backup) {
        velocidade = 0.06;
      }
      for (let i = 0; i < maxPacotes; i++) {
        const pacote = aresta.pacotes[i];
        if (i < quantidade) {
          let distancia = 0;
          if (reduzirMovimento) {
            distancia = ((i + 0.5) / quantidade) * aresta.comprimento;
          } else {
            distancia = (agora * velocidade + (i / quantidade) * aresta.comprimento) % aresta.comprimento;
          }
          const ponto = aresta.caminho.getPointAtLength(distancia);
          pacote.setAttribute("cx", ponto.x.toFixed(1));
          pacote.setAttribute("cy", ponto.y.toFixed(1));
          pacote.setAttribute("visibility", "visible");
        } else {
          pacote.setAttribute("visibility", "hidden");
        }
      }
    });
    if (modoAtual === "backup") {
      let porcentagem = 100;
      if (!reduzirMovimento) {
        porcentagem = Math.min(100, Math.floor((agora - inicioModo) / 70));
      }
      let texto = "";
      if (porcentagem < 100) {
        texto = "Copiando " + porcentagem + "%";
      } else {
        texto = "Concluído";
      }
      if (texto !== ultimoTextoBackup) {
        ultimoTextoBackup = texto;
        document.querySelector('[data-st-valor="backup"]').textContent = texto;
        const led = document.querySelector('[data-st-led="backup"]');
        if (porcentagem < 100) {
          led.className = "led alerta";
        } else {
          led.className = "led ligado";
        }
      }
    }
  }

  function quadro(agora) {
    if (!visivel || reduzirMovimento) {
      rodando = false;
      return;
    }
    desenharPacotes(agora);
    requestAnimationFrame(quadro);
  }

  function iniciarAnimacao() {
    if (rodando || reduzirMovimento) {
      return;
    }
    rodando = true;
    requestAnimationFrame(quadro);
  }

  function aplicarModo(nome) {
    modoAtual = nome;
    inicioModo = performance.now();
    ultimoTextoBackup = "";
    const modo = mapaModos[nome];
    textoModo.textContent = modo.texto;
    botoesModo.forEach(function (botao) {
      if (botao.dataset.modo === nome) {
        botao.setAttribute("aria-pressed", "true");
      } else {
        botao.setAttribute("aria-pressed", "false");
      }
    });
    Object.keys(modo.status).forEach(function (chave) {
      const estado = modo.status[chave];
      document.querySelector('[data-st-led="' + chave + '"]').className = "led " + estado[0];
      document.querySelector('[data-st-valor="' + chave + '"]').textContent = estado[1];
    });
    mapaArestas.forEach(function (aresta) {
      const caida = modo.caidas.includes(aresta.id);
      const ativa = (modo.fluxos[aresta.id] || 0) > 0;
      let apagada = false;
      if (modo.foco.length > 0) {
        if (!modo.foco.includes(aresta.de) || !modo.foco.includes(aresta.para)) {
          apagada = true;
        }
      }
      aresta.caminho.classList.toggle("caida", caida);
      aresta.caminho.classList.toggle("ativa", ativa && !caida);
      aresta.caminho.classList.toggle("apagada", apagada);
      aresta.marcaFalha.classList.toggle("visivel", caida);
      if (aresta.textoRotulo) {
        aresta.textoRotulo.classList.toggle("caido", caida);
        aresta.textoRotulo.classList.toggle("apagada", apagada);
      }
    });
    Object.keys(elementosNos).forEach(function (id) {
      const no = elementosNos[id];
      if (modo.foco.length > 0) {
        no.classList.toggle("apagado", !modo.foco.includes(id));
        no.classList.toggle("destaque", modo.foco.includes(id));
      } else {
        no.classList.remove("apagado");
        no.classList.remove("destaque");
      }
    });
    desenharPacotes(performance.now());
    iniciarAnimacao();
  }

  function mostrarInfo(id) {
    const dados = mapaNos[id];
    Object.keys(elementosNos).forEach(function (chave) {
      elementosNos[chave].classList.toggle("selecionado", chave === id);
    });
    infoTitulo.textContent = dados.titulo;
    infoTexto.textContent = dados.texto;
    infoLinks.textContent = "";
    const rotulo = document.createElement("small");
    rotulo.textContent = "Especialidades relacionadas";
    infoLinks.appendChild(rotulo);
    dados.relacionadas.forEach(function (chave) {
      const link = document.createElement("a");
      link.className = "info-link";
      link.href = "#esp-" + chave;
      link.textContent = especialidades[chave];
      link.addEventListener("click", function (evento) {
        evento.preventDefault();
        abrirEspecialidade(chave);
      });
      infoLinks.appendChild(link);
    });
  }

  Object.keys(elementosNos).forEach(function (id) {
    elementosNos[id].addEventListener("click", function () {
      mostrarInfo(id);
    });
  });

  botoesModo.forEach(function (botao) {
    botao.addEventListener("click", function () {
      aplicarModo(botao.dataset.modo);
    });
  });

  if ("ResizeObserver" in window) {
    const observadorTamanho = new ResizeObserver(function () {
      calcularGeometria();
    });
    observadorTamanho.observe(mapa);
  } else {
    window.addEventListener("resize", calcularGeometria);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(calcularGeometria);
  }

  if ("IntersectionObserver" in window) {
    const observadorTela = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        visivel = entrada.isIntersecting;
      });
      if (visivel) {
        iniciarAnimacao();
      }
    }, { threshold: 0.05 });
    observadorTela.observe(mapa);
  } else {
    visivel = true;
  }

  calcularGeometria();
  aplicarModo("normal");
}

function criarAleatorio(semente) {
  let a = semente;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t = t ^ (t + Math.imul(t ^ (t >>> 7), t | 61));
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function montarRack() {
  const svg = document.getElementById("rack");
  if (!svg) {
    return;
  }
  const legenda = document.querySelector("[data-rack-texto]");
  const botao = document.querySelector("[data-rack-botao]");
  const aleatorio = criarAleatorio(20261016);
  const totalPortas = 16;
  const xPrimeira = 86;
  const passoPorta = 228 / (totalPortas - 1);
  const yPatch = 68;
  const ySwitch = 162;
  const textos = {
    antes: "Antes: cabos sem padrão, e ninguém sabe o que liga onde.",
    depois: "Depois: rede organizada, identificada e pronta para crescer."
  };

  function xPorta(indice) {
    return xPrimeira + indice * passoPorta;
  }

  function entre(minimo, maximo) {
    return minimo + aleatorio() * (maximo - minimo);
  }

  function atrasoAleatorio(elemento) {
    elemento.style.animationDelay = (aleatorio() * 1.6).toFixed(2) + "s";
  }

  function etiqueta(x, y, texto) {
    criarSvg("rect", { x: x, y: y, width: 60, height: 14, rx: 2, class: "rk-etiqueta" }, svg);
    const rotulo = criarSvg("text", { x: x + 30, y: y + 9.8, "text-anchor": "middle", class: "rk-etiqueta-texto" }, svg);
    rotulo.textContent = texto;
  }

  function ledsEstado(y) {
    criarSvg("circle", { cx: 272, cy: y, r: 2.4, class: "rk-led-energia" }, svg);
    criarSvg("circle", { cx: 284, cy: y, r: 2.4, class: "rk-led rk-led-status" }, svg);
  }

  const defs = criarSvg("defs", {}, svg);
  const filtro = criarSvg("filter", { id: "sombra-cabo", x: "-10%", y: "-10%", width: "120%", height: "130%" }, defs);
  criarSvg("feDropShadow", { dx: "0", dy: "2.2", stdDeviation: "1.4", "flood-color": "#010B12", "flood-opacity": "0.6" }, filtro);

  criarSvg("rect", { x: 36, y: 16, width: 328, height: 568, rx: 12, class: "rk-moldura" }, svg);
  [50, 334].forEach(function (x) {
    criarSvg("rect", { x: x, y: 28, width: 16, height: 544, rx: 2, class: "rk-trilho" }, svg);
    for (let y = 36; y < 564; y = y + 13) {
      criarSvg("rect", { x: x + 5, y: y, width: 6, height: 6, rx: 1, class: "rk-furo" }, svg);
    }
  });

  criarSvg("rect", { x: 66, y: 48, width: 268, height: 40, rx: 3, class: "rk-chapa-clara" }, svg);
  for (let i = 0; i < totalPortas; i++) {
    const numero = criarSvg("text", { x: xPorta(i).toFixed(1), y: 58.5, "text-anchor": "middle", class: "rk-numero" }, svg);
    numero.textContent = String(i + 1);
    criarSvg("rect", { x: (xPorta(i) - 5.5).toFixed(1), y: 62, width: 11, height: 10, rx: 1.5, class: "rk-porta" }, svg);
  }

  criarSvg("rect", { x: 66, y: 94, width: 268, height: 40, rx: 3, class: "rk-chapa-escura" }, svg);
  for (let k = 0; k < 9; k++) {
    criarSvg("rect", { x: 74 + k * 31.5, y: 99, width: 7, height: 30, rx: 2, class: "rk-dedo" }, svg);
  }

  criarSvg("rect", { x: 66, y: 140, width: 268, height: 40, rx: 3, class: "rk-chapa-switch" }, svg);
  for (let i = 0; i < totalPortas; i++) {
    const led = criarSvg("circle", { cx: xPorta(i).toFixed(1), cy: 150, r: 1.9, class: "rk-led rk-led-porta" }, svg);
    if (aleatorio() < 0.4) {
      led.classList.add("alerta");
    }
    atrasoAleatorio(led);
    criarSvg("rect", { x: (xPorta(i) - 5.5).toFixed(1), y: 156, width: 11, height: 10, rx: 1.5, class: "rk-porta-sw" }, svg);
  }

  criarSvg("rect", { x: 66, y: 196, width: 268, height: 40, rx: 3, class: "rk-chapa" }, svg);
  for (let k = 0; k < 10; k++) {
    const x = 82 + k * 15;
    const led = criarSvg("circle", { cx: x + 5.5, cy: 205, r: 1.6, class: "rk-led rk-led-porta" }, svg);
    atrasoAleatorio(led);
    criarSvg("rect", { x: x, y: 210, width: 11, height: 10, rx: 1.5, class: "rk-porta-sw" }, svg);
  }
  etiqueta(260, 201, "MIKROTIK");
  ledsEstado(225);

  function servidor(y, altura, rotulo, baias, larguraBaia) {
    criarSvg("rect", { x: 66, y: y, width: 268, height: altura, rx: 3, class: "rk-chapa" }, svg);
    for (let k = 0; k < baias; k++) {
      const x = 80 + k * (larguraBaia + 4);
      criarSvg("rect", { x: x, y: y + 10, width: larguraBaia, height: altura - 20, rx: 2, class: "rk-baia" }, svg);
      const led = criarSvg("circle", { cx: x + larguraBaia / 2, cy: y + altura - 17, r: 1.5, class: "rk-led rk-led-porta" }, svg);
      atrasoAleatorio(led);
    }
    etiqueta(260, y + 12, rotulo);
    ledsEstado(y + altura - 20);
  }

  servidor(244, 72, "PROXMOX", 8, 18);
  servidor(324, 72, "PBS", 4, 40);

  criarSvg("rect", { x: 66, y: 404, width: 268, height: 56, rx: 3, class: "rk-chapa-escura" }, svg);
  for (let linha = 0; linha < 3; linha++) {
    for (let coluna = 0; coluna < 12; coluna++) {
      criarSvg("rect", { x: 80 + coluna * 13.5, y: 418 + linha * 11, width: 8, height: 3, rx: 1.5, class: "rk-ranhura" }, svg);
    }
  }
  criarSvg("rect", { x: 250, y: 412, width: 72, height: 40, rx: 3, class: "rk-etiqueta" }, svg);
  criarSvg("use", { href: "#ts-simbolo", x: 268, y: 414, width: 36, height: 36 }, svg);

  criarSvg("rect", { x: 66, y: 468, width: 268, height: 68, rx: 3, class: "rk-chapa" }, svg);
  criarSvg("rect", { x: 82, y: 485, width: 72, height: 34, rx: 3, class: "rk-lcd" }, svg);
  const lcd = criarSvg("text", { x: 118, y: 507, "text-anchor": "middle", class: "rk-lcd-texto" }, svg);
  lcd.textContent = "100%";
  for (let k = 0; k < 3; k++) {
    criarSvg("circle", { cx: 176 + k * 16, cy: 502, r: 5, class: "rk-baia" }, svg);
  }
  etiqueta(260, 480, "NOBREAK");
  ledsEstado(518);

  function corDoCabo(indice) {
    if (indice < 6) {
      return "#3A9BD8";
    } else if (indice < 10) {
      return "#22C3E6";
    } else if (indice < 14) {
      return "#D3DEE6";
    } else {
      return "#E8C547";
    }
  }

  const ordem = [];
  for (let i = 0; i < totalPortas; i++) {
    ordem.push(i);
  }
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    const temporario = ordem[i];
    ordem[i] = ordem[j];
    ordem[j] = temporario;
  }

  const grupoCabos = criarSvg("g", { filter: "url(#sombra-cabo)" }, svg);
  const cabos = [];
  for (let i = 0; i < totalPortas; i++) {
    const xInicio = xPorta(i);
    const xFimBaguncado = xPorta(ordem[i]);
    const baguncado = [
      xInicio, yPatch,
      limitar(xInicio + entre(-120, 120), 22, 378), yPatch + entre(150, 360),
      limitar(xFimBaguncado + entre(-120, 120), 22, 378), ySwitch + entre(110, 320),
      xFimBaguncado, ySwitch
    ];
    const organizado = [
      xInicio, yPatch,
      xInicio, yPatch + 30,
      xInicio, ySwitch - 30,
      xInicio, ySwitch
    ];
    const cor = corDoCabo(i);
    const caminho = criarSvg("path", { class: "rk-cabo", stroke: cor }, grupoCabos);
    criarSvg("rect", { x: (xInicio - 4).toFixed(1), y: yPatch - 4, width: 8, height: 8, rx: 1.5, fill: cor }, grupoCabos);
    const plug = criarSvg("rect", { x: (xFimBaguncado - 4).toFixed(1), y: ySwitch - 4, width: 8, height: 8, rx: 1.5, fill: cor }, grupoCabos);
    cabos.push({ baguncado: baguncado, organizado: organizado, caminho: caminho, plug: plug });
  }

  criarSvg("rect", { x: 76, y: 104, width: 248, height: 5, rx: 2.5, class: "rk-velcro" }, svg);
  criarSvg("rect", { x: 76, y: 119, width: 248, height: 5, rx: 2.5, class: "rk-velcro" }, svg);

  const duracaoCabo = 1300;
  const intervalo = 70;
  const duracaoTotal = duracaoCabo + intervalo * (totalPortas - 1);
  let tempoAtual = 0;
  let tempoAlvo = 0;
  let ultimoQuadro = null;
  let rodando = false;
  let iniciou = false;

  function suavizar(t) {
    if (t < 0.5) {
      return 4 * t * t * t;
    } else {
      return 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  }

  function montarCaminho(p) {
    return "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " C" + p[2].toFixed(1) + " " + p[3].toFixed(1) + " " + p[4].toFixed(1) + " " + p[5].toFixed(1) + " " + p[6].toFixed(1) + " " + p[7].toFixed(1);
  }

  function desenhar() {
    cabos.forEach(function (cabo, indice) {
      let local = (tempoAtual - indice * intervalo) / duracaoCabo;
      if (local < 0) {
        local = 0;
      } else if (local > 1) {
        local = 1;
      }
      const t = suavizar(local);
      const pontos = [];
      for (let k = 0; k < 8; k++) {
        pontos.push(cabo.baguncado[k] + (cabo.organizado[k] - cabo.baguncado[k]) * t);
      }
      cabo.caminho.setAttribute("d", montarCaminho(pontos));
      cabo.plug.setAttribute("x", (pontos[6] - 4).toFixed(1));
    });
  }

  function finalizar() {
    if (tempoAtual === duracaoTotal) {
      svg.dataset.estado = "organizado";
    } else {
      svg.dataset.estado = "baguncado";
    }
  }

  function quadro(agora) {
    if (ultimoQuadro === null) {
      ultimoQuadro = agora;
    }
    let delta = agora - ultimoQuadro;
    if (delta > 64) {
      delta = 64;
    }
    ultimoQuadro = agora;
    if (tempoAlvo > tempoAtual) {
      tempoAtual = Math.min(tempoAtual + delta, tempoAlvo);
    } else {
      tempoAtual = Math.max(tempoAtual - delta * 1.4, tempoAlvo);
    }
    desenhar();
    if (tempoAtual === tempoAlvo) {
      rodando = false;
      ultimoQuadro = null;
      finalizar();
    } else {
      requestAnimationFrame(quadro);
    }
  }

  function irPara(organizar) {
    if (organizar) {
      tempoAlvo = duracaoTotal;
      legenda.textContent = textos.depois;
      botao.textContent = "Ver como era";
    } else {
      tempoAlvo = 0;
      legenda.textContent = textos.antes;
      botao.textContent = "Ver organizado";
    }
    if (reduzirMovimento) {
      tempoAtual = tempoAlvo;
      desenhar();
      finalizar();
      return;
    }
    svg.dataset.estado = "transicao";
    if (!rodando) {
      rodando = true;
      ultimoQuadro = null;
      requestAnimationFrame(quadro);
    }
  }

  function iniciar() {
    if (iniciou) {
      return;
    }
    iniciou = true;
    window.setTimeout(function () {
      irPara(true);
    }, 700);
  }

  desenhar();

  botao.addEventListener("click", function () {
    iniciou = true;
    if (tempoAlvo === duracaoTotal) {
      irPara(false);
    } else {
      irPara(true);
    }
  });

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          observador.disconnect();
          iniciar();
        }
      });
    }, { threshold: 0.4 });
    observador.observe(svg);
  } else {
    iniciar();
  }
}

controlarCarregamento();
montarClientes();
prepararLinksWhatsapp();
preencherDados();
atualizarStatus();
window.setInterval(atualizarStatus, 60000);
controlarTopo();
controlarMenu();
controlarFormulario();
controlarPilares();
montarRack();
montarMapa();