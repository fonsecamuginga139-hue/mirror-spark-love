import LegalLayout from "@/components/LegalLayout";

const TermsPage = () => {
  return (
    <LegalLayout
      title="Termos de Serviço"
      description="Os termos e condições que regem a utilização da FinanceFLOW."
      path="/terms"
    >
      <p>
        Estes Termos de Serviço (&quot;Termos&quot;) regem o seu acesso e utilização da FinanceFLOW. Ao criar
        uma conta ou utilizar o serviço, concorda em ficar vinculado a estes Termos.
      </p>

      <h2>1. O Serviço</h2>
      <p>
        A FinanceFLOW é uma aplicação de finanças pessoais que permite aos utilizadores individuais
        acompanhar transações, gerir metas, monitorizar entradas recorrentes e visualizar a sua atividade
        financeira. O serviço destina-se a uso pessoal e não comercial.
      </p>

      <h2>2. Contas</h2>
      <p>
        É responsável por manter a confidencialidade das credenciais da sua conta e por toda a atividade
        que ocorre na sua conta. Deve fornecer informação exata ao registar-se.
      </p>

      <h2>3. Subscrições e Preços</h2>
      <ul>
        <li><strong>Teste Gratuito:</strong> 7 dias de acesso total sem custos.</li>
        <li><strong>Plano Mensal:</strong> 7€/mês, faturado mensalmente.</li>
        <li><strong>Plano Anual:</strong> 30€/ano, faturado anualmente.</li>
      </ul>
      <p>
        As subscrições renovam-se automaticamente até serem canceladas. Pode cancelar a qualquer momento
        no seu portal de faturação ou contactando o suporte.
      </p>

      <h2>4. Utilização Aceitável</h2>
      <ul>
        <li>Não tente perturbar, fazer engenharia inversa ou abusar do serviço.</li>
        <li>Não utilize o serviço para atividades ilegais ou fraudulentas.</li>
        <li>Não tente aceder à conta ou aos dados de outro utilizador.</li>
      </ul>

      <h2>5. Propriedade Intelectual</h2>
      <p>
        Toda a marca, design, código e conteúdo da FinanceFLOW pertencem à FinanceFLOW e estão protegidos
        pelas leis de propriedade intelectual aplicáveis. Mantém a propriedade dos dados financeiros que
        introduz.
      </p>

      <h2>6. Aviso Legal</h2>
      <p>
        A FinanceFLOW é uma ferramenta de organização de finanças pessoais. Não presta aconselhamento
        financeiro, de investimento, jurídico ou fiscal. É o único responsável por quaisquer decisões
        tomadas com base na informação apresentada na app.
      </p>

      <h2>7. Limitação de Responsabilidade</h2>
      <p>
        Na máxima extensão permitida por lei, a FinanceFLOW não será responsável por quaisquer danos
        indiretos, incidentais ou consequenciais resultantes da utilização ou incapacidade de utilizar o
        serviço.
      </p>

      <h2>8. Rescisão</h2>
      <p>
        Podemos suspender ou encerrar contas que violem estes Termos. Pode encerrar a sua conta a qualquer
        momento nas definições do seu perfil.
      </p>

      <h2>9. Alterações a Estes Termos</h2>
      <p>
        Podemos atualizar estes Termos periodicamente. A utilização continuada do serviço após alterações
        constitui aceitação dos Termos atualizados.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Questões sobre estes Termos podem ser enviadas para{" "}
        <a href="mailto:financeflow.team@gmail.com">financeflow.team@gmail.com</a>.
      </p>
    </LegalLayout>
  );
};

export default TermsPage;
