import LegalLayout from "@/components/LegalLayout";

const PrivacyPolicyPage = () => {
  return (
    <LegalLayout
      title="Política de Privacidade"
      description="Saiba como a FinanceFLOW recolhe, utiliza e protege os seus dados pessoais e financeiros."
      path="/privacy-policy"
    >
      <p>
        A FinanceFLOW (&quot;nós&quot;, &quot;a nossa&quot;, &quot;connosco&quot;) está empenhada em proteger a sua
        privacidade. Esta Política de Privacidade explica como recolhemos, utilizamos, armazenamos e
        protegemos as informações que fornece ao utilizar a nossa aplicação de finanças pessoais.
      </p>

      <h2>1. Informação que Recolhemos</h2>
      <p>Recolhemos os seguintes tipos de informação:</p>
      <ul>
        <li><strong>Dados de conta:</strong> nome, e-mail, moeda e preferências de idioma.</li>
        <li><strong>Dados financeiros:</strong> transações, cartões, categorias, metas e entradas recorrentes que cria.</li>
        <li><strong>Dados de utilização:</strong> tipo de dispositivo, interações com a app e informação de diagnóstico.</li>
      </ul>

      <h2>2. Como Utilizamos a Sua Informação</h2>
      <ul>
        <li>Fornecer e operar o serviço FinanceFLOW.</li>
        <li>Processar subscrições e eventos relacionados com pagamentos.</li>
        <li>Melhorar o desempenho, a fiabilidade e a segurança do produto.</li>
        <li>Comunicar atualizações importantes sobre a sua conta.</li>
      </ul>

      <h2>3. Armazenamento e Segurança de Dados</h2>
      <p>
        Os seus dados são armazenados em infraestrutura encriptada fornecida pela Supabase. Aplicamos
        práticas de segurança de nível empresarial, incluindo segurança ao nível da linha, ligações
        encriptadas e controlos de acesso rigorosos. Apenas você pode aceder aos seus dados financeiros
        através da sua conta autenticada.
      </p>

      <h2>4. Partilha de Informação</h2>
      <p>
        Não vendemos nem alugamos a sua informação pessoal. Apenas partilhamos dados com processadores
        terceiros estritamente necessários para operar o serviço (por exemplo, o fornecedor de pagamentos
        para a faturação das subscrições).
      </p>

      <h2>5. Os Seus Direitos</h2>
      <p>
        Pode aceder, corrigir, exportar ou eliminar os seus dados pessoais a qualquer momento a partir das
        definições do seu perfil, ou contactando-nos através de <a href="mailto:financeflow.team@gmail.com">financeflow.team@gmail.com</a>.
      </p>

      <h2>6. Retenção de Dados</h2>
      <p>
        Mantemos os seus dados enquanto a sua conta estiver ativa. Se eliminar a sua conta, os seus dados
        financeiros são removidos permanentemente dos nossos sistemas dentro de um período razoável.
      </p>

      <h2>7. Cookies e Armazenamento Local</h2>
      <p>
        A FinanceFLOW utiliza armazenamento local e cookies estritamente para manter a sua sessão
        autenticada e melhorar o desempenho. Não utilizamos rastreadores de publicidade de terceiros.
      </p>

      <h2>8. Alterações a Esta Política</h2>
      <p>
        Podemos atualizar esta Política de Privacidade periodicamente. Alterações relevantes serão
        comunicadas através da app ou por e-mail.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Para questões relacionadas com privacidade, contacte-nos através de{" "}
        <a href="mailto:financeflow.team@gmail.com">financeflow.team@gmail.com</a>.
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
