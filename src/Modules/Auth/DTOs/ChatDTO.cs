using System;
using System.Collections.Generic;

public class ChatConversa
{
    public int Id { get; set; }
    // "PRIVADO" ou "GRUPO"
    public string Tipo { get; set; } = "PRIVADO";

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public int? UltimaMensagemId { get; set; }

    public DateTime? UltimaMensagemCriada { get; set; }

    // Navegação
    // public ICollection<Participante> Participante { get; set; } = new List<Participante>();
    // public ICollection<Mensagem> Mensagens { get; set; } = new List<Mensagem>();
}
