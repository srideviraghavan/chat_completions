import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI


def main() -> None:
    load_dotenv()

    # LM Studio exposes an OpenAI-compatible endpoint.
    base_url = os.getenv("OPENAI_BASE_URL", "http://localhost:1234/v1")
    api_key = os.getenv("OPENAI_API_KEY", "lm-studio")
    model = os.getenv("OPENAI_MODEL", "qwen3.5-9b")

    llm = ChatOpenAI(
        model=model,
        temperature=0,
        base_url=base_url,
        api_key=api_key,
    )
    response = llm.invoke("Write one short sentence about LangChain.")
    print(response.content)


if __name__ == "__main__":
    main()
