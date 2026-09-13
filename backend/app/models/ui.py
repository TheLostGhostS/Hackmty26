from typing import Literal, Union
from pydantic import BaseModel, Field

class Option(BaseModel):
    label: str
    value: str

class ChartDataset(BaseModel):
    label: str
    values: list[float]

class TextComponent(BaseModel):
    type: Literal["text"]
    id: str
    text: str
    variant: Literal["title", "subtitle", "body", "caption"] = "body"

class ButtonComponent(BaseModel):
    type: Literal["button"]
    id: str
    label: str
    action: str

class SliderComponent(BaseModel):
    type: Literal["slider"]
    id: str
    label: str
    min: float
    max: float
    step: float = 1
    default_value: float | None = None

class DropdownComponent(BaseModel):
    type: Literal["dropdown"]
    id: str
    label: str
    options: list[Option]
    default_value: str | None = None

class MultiSelectComponent(BaseModel):
    type: Literal["multi_select"]
    id: str
    label: str
    options: list[Option]
    default_values: list[str] | None = None

class CheckboxComponent(BaseModel):
    type: Literal["checkbox"]
    id: str
    label: str
    default_checked: bool | None = None

class ChartComponent(BaseModel):
    type: Literal["chart"]
    id: str
    title: str
    chart_type: Literal["bar", "line", "pie"]
    labels: list[str]
    datasets: list[ChartDataset]

UIComponent = Union[
    TextComponent,
    ButtonComponent,
    SliderComponent,
    DropdownComponent,
    MultiSelectComponent,
    CheckboxComponent,
    ChartComponent,
]

class UIResponse(BaseModel):
    components: list[UIComponent] = Field(
        description=(
            "Components required to build the interface. "
            "Include only components that are useful for the user's request. "
            "Any component type may appear zero, one, or multiple times."
        )
    )
