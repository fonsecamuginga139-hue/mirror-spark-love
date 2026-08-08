import {
  Tag,
  Wallet,
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Heart,
  Book,
  Gamepad2,
  Shirt,
  Zap,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Gift,
  Plane,
  Music,
  Dumbbell,
  Coffee,
  Phone,
  Wifi,
  Droplets,
  Baby,
  PawPrint,
  Scissors,
  Pill,
  Building,
  Tv,
  CreditCard,
  Banknote,
  PiggyBank,
  Receipt,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: { [key: string]: LucideIcon } = {
  "tag": Tag,
  "wallet": Wallet,
  "home": Home,
  "shopping-cart": ShoppingCart,
  "utensils": Utensils,
  "car": Car,
  "heart": Heart,
  "book": Book,
  "gamepad-2": Gamepad2,
  "shirt": Shirt,
  "zap": Zap,
  "more-horizontal": MoreHorizontal,
  "briefcase": Briefcase,
  "trending-up": TrendingUp,
  "gift": Gift,
  "plane": Plane,
  "music": Music,
  "dumbbell": Dumbbell,
  "coffee": Coffee,
  "phone": Phone,
  "wifi": Wifi,
  "droplets": Droplets,
  "baby": Baby,
  "paw-print": PawPrint,
  "scissors": Scissors,
  "pill": Pill,
  "building": Building,
  "tv": Tv,
  "credit-card": CreditCard,
  "banknote": Banknote,
  "piggy-bank": PiggyBank,
  "receipt": Receipt,
  "shopping-bag": ShoppingBag,
};

export const ICON_OPTIONS = Object.keys(CATEGORY_ICONS);

export const getCategoryIcon = (iconName: string | null | undefined): LucideIcon => {
  if (!iconName || !CATEGORY_ICONS[iconName]) {
    return Tag;
  }
  return CATEGORY_ICONS[iconName];
};

// Auto-suggest icon based on category name
export const suggestIconForCategory = (name: string): string => {
  const nameLower = name.toLowerCase();
  
  const suggestions: { [key: string]: string[] } = {
    "wallet": ["salário", "salario", "renda", "pagamento", "dinheiro"],
    "home": ["aluguel", "casa", "moradia", "condomínio", "condominio", "iptu"],
    "shopping-cart": ["mercado", "supermercado", "compras", "feira"],
    "utensils": ["alimentação", "alimentacao", "comida", "restaurante", "lanche", "refeição"],
    "car": ["transporte", "uber", "gasolina", "combustível", "carro", "ônibus", "metro"],
    "heart": ["saúde", "saude", "médico", "medico", "hospital", "farmácia", "farmacia"],
    "book": ["educação", "educacao", "escola", "curso", "faculdade", "livro", "estudo"],
    "gamepad-2": ["lazer", "entretenimento", "jogo", "game", "diversão"],
    "shirt": ["vestuário", "vestuario", "roupa", "calçado", "calcado", "acessório"],
    "zap": ["serviços", "servicos", "luz", "energia", "conta"],
    "briefcase": ["trabalho", "freelance", "negócio", "negocio", "empresa"],
    "trending-up": ["investimento", "poupança", "poupanca", "ações", "acoes", "renda fixa"],
    "gift": ["presente", "aniversário", "aniversario", "doação", "doacao"],
    "plane": ["viagem", "férias", "ferias", "passagem", "hotel", "turismo"],
    "music": ["música", "musica", "spotify", "show", "concerto"],
    "dumbbell": ["academia", "esporte", "fitness", "exercício", "exercicio"],
    "coffee": ["café", "cafe", "lanche", "padaria"],
    "phone": ["telefone", "celular", "internet", "plano"],
    "wifi": ["internet", "streaming", "netflix", "assinatura"],
    "droplets": ["água", "agua", "saneamento"],
    "baby": ["bebê", "bebe", "criança", "crianca", "filho", "filha"],
    "paw-print": ["pet", "animal", "cachorro", "gato", "veterinário"],
    "scissors": ["beleza", "cabelo", "salão", "salao", "estética", "estetica"],
    "pill": ["remédio", "remedio", "medicamento", "farmácia"],
    "building": ["banco", "tarifa", "taxa", "financeiro"],
    "tv": ["tv", "televisão", "televisao", "cabo", "streaming"],
    "piggy-bank": ["economia", "reserva", "guardar"],
    "receipt": ["imposto", "taxa", "tributo", "multa"],
    "shopping-bag": ["loja", "shopping", "e-commerce", "online"],
  };

  for (const [icon, keywords] of Object.entries(suggestions)) {
    if (keywords.some((keyword) => nameLower.includes(keyword))) {
      return icon;
    }
  }

  return "tag";
};
