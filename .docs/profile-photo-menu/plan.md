# Foto do perfil

Autorização: solicitação direta do usuário para implementar câmera/upload e publicar diretamente na dev.

Ao tocar no avatar, abrir popup com Ver foto e Atualizar. Atualizar oferece câmera ou upload JPG/PNG até 5 MiB. Cancelamento não altera o perfil; erros permanecem visíveis; impedir operações simultâneas. Preservar remoção existente. Reutilizar PUT /profiles/me/photo autenticado já existente no backend, sem duplicar rota.
