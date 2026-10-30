# おえかきペット 公式サイト

「おえかきペット」のプロモーションページです。

- 公開URL: https://ki-84.github.io/paint-pet-support/
- GitHub Pages: `main` ブランチのルート `/` から公開
- ビルド不要。`index.html`、`style.css`、`app.js`、`assets/` がサイト本体

## ローカル表示

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

看板キャラクター「ぽこ」は採用された元画像を参照し、表示サイズだけを指定しています。おえかき体験は64×64のキャンバスで、描いた絵を外部に送信しません。
