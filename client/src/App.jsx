import React, { useMemo, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import hljs from 'highlight.js';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.bubble.css';
import 'highlight.js/styles/vs2015.css';
import './App.css';

const App = (props) => {
  const [text, setText] = useState('');
  const quillRef = useRef();

  console.log(text);

  const videoHandler = () => {
    console.log('video handler on!!');
  };

  const imageHandler = (e) => {
    console.log('에디터에서 이미지 버튼을 클릭하면 이 핸들러가 시작됩니다!');

    // 1. 이미지를 저장할 input type=file DOM을 만든다.
    const input = document.createElement('input');

    // 속성 써주기
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click(); // 에디터 이미지버튼을 클릭하면 이 input이 클릭된다.
    // input이 클릭되면 파일 선택창이 나타난다.
    console.log(input);

    input.addEventListener('change', async () => {
      console.log('File OnChange!');
      const file = input.files[0];
      console.log(file);

      // multer에 맞는 형식으로 데이터 만들어준다.
      const formData = new FormData();
      const filename = `${Date.now()}${file.name}`;
      formData.append('name', filename);
      formData.append('file', file); // formData는 키-밸류 구조
      // 백엔드 multer라우터에 이미지를 보낸다.
      try {
        const result = await axios.post(
          'http://localhost:8080/img/upload',
          formData
        );
        console.log('성공 시, 백엔드가 보내주는 데이터', result.data);
        const IMG_URL = result.data;
        // 이 URL을 img 태그의 src에 넣은 요소를 현재 에디터의 커서에 넣어주면 에디터 내에서 이미지가 나타난다
        // src가 base64가 아닌 짧은 URL이기 때문에 데이터베이스에 에디터의 전체 글 내용을 저장할 수있게된다
        // 이미지는 꼭 로컬 백엔드 uploads 폴더가 아닌 다른 곳에 저장해 URL로 사용하면된다.

        // 이미지 태그를 에디터에 써주기 - 여러 방법이 있다.
        const editor = quillRef.current.getEditor(); // 에디터 객체 가져오기
        // 1. 에디터 root의 innerHTML을 수정해주기
        // editor의 root는 에디터 컨텐츠들이 담겨있다. 거기에 img태그를 추가해준다.
        // 이미지를 업로드하면 -> 멀터에서 이미지 경로 URL을 받아와 -> 이미지 요소로 만들어 에디터 안에 넣어준다.
        // editor.root.innerHTML =
        //   editor.root.innerHTML + `<img src=${IMG_URL} /><br/>`; // 현재 있는 내용들 뒤에 써줘야한다.

        // 2. 현재 에디터 커서 위치값을 가져온다
        const range = editor.getSelection();
        // 가져온 위치에 이미지를 삽입한다
        editor.insertEmbed(range.index, 'image', IMG_URL);
        // 향후 교차출처 에러시 사용 메소드
        // document
        //   .querySelectorAll('img')[0]
        //   .setAttribute('crossOrigin', 'anonymous');
      } catch (error) {
        console.log('실패!!!');
      }
    });
  };

  hljs.configure({
    languages: ['javascript', 'html', 'css', 'react', 'sass', 'typescript'],
  });

  const modules = useMemo(() => {
    return {
      syntax: {
        highlight: (text) => hljs.highlightAuto(text).value,
      },
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          ['image', 'video', 'code-block'],
        ],
        handlers: {
          // 이미지 처리는 우리가 직접 imageHandler라는 함수로 처리할 것이다.
          image: imageHandler,
          video: videoHandler,
        },
      },
    };
  }, []);

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'image',
    'code-block',
  ];

  const inputText = (e) => {
    e.preventDefault();
  };

  const editorText = text;

  console.log(editorText);

  const detectRemoveImg = (e) => {
    console.log(text.lastIndexOf('img'));
    console.log(e.code);
    if (text.lastIndexOf('img') !== -1) {
      let firstSplit = text.split('src="')[1];
      let secondSplit = firstSplit.split('"></p>')[0];
      console.log(secondSplit);
    }
  };

  return (
    <>
      <form onSubmit={inputText}>
        <ReactQuill
          ref={quillRef}
          modules={modules}
          formats={formats}
          value={text}
          onChange={setText}
          onKeyDown={detectRemoveImg}
          theme={'snow'}
        />
        <button type='submit'>Input</button>
      </form>
      <div className='ql-snow'>
        <div
          className='ql-editor'
          dangerouslySetInnerHTML={{ __html: editorText }}
          style={{ width: '98vw', height: 'fitContent' }}
        ></div>
      </div>
    </>
  );
};

export default App;
