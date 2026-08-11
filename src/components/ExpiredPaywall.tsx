interface ExpiredPaywallProps {
  children: React.ReactNode;
}

/**
 * A aplicação já não bloqueia o acesso por assinatura.
 * Este componente ficou como simples passagem para manter compatibilidade
 * com ecrãs antigos que ainda o importam.
 */
const ExpiredPaywall = ({ children }: ExpiredPaywallProps) => <>{children}</>;

export default ExpiredPaywall;
