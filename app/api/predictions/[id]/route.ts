import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Em uma implementação real, você excluiria o palpite do banco de dados
    // Exemplo: await db.predictions.delete({ where: { id } })

    return NextResponse.json({ message: `Palpite ${id} excluído com sucesso` })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir palpite" }, { status: 500 })
  }
}
