using ValeraApi.Models;

namespace ValeraApi.Tests;

public class ValeraTests
{
    [Fact]
    public void GoToWork_ShouldChangeState()
    {
        var valera = new Valera(
            alcohol: 20,
            cheerfulness: 5,
            fatigue: 0,
            money: 0);

        var result = valera.GoToWork();

        Assert.True(result);
        Assert.Equal(0, valera.Cheerfulness);
        Assert.Equal(0, valera.Alcohol);
        Assert.Equal(100, valera.Money);
        Assert.Equal(70, valera.Fatigue);
    }

    [Fact]
    public void GoToWork_ShouldNotWork_WhenAlcoholTooHigh()
    {
        var valera = new Valera(
            alcohol: 50,
            fatigue: 0,
            money: 0);

        var result = valera.GoToWork();

        Assert.False(result);
        Assert.Equal(50, valera.Alcohol);
        Assert.Equal(0, valera.Money);
    }

    [Fact]
    public void GoToWork_ShouldNotWork_WhenFatigueTooHigh()
    {
        var valera = new Valera(
            alcohol: 20,
            fatigue: 10,
            money: 0);

        var result = valera.GoToWork();

        Assert.False(result);
        Assert.Equal(20, valera.Alcohol);
        Assert.Equal(10, valera.Fatigue);
    }

    [Fact]
    public void ContemplateNature_ShouldChangeState()
    {
        var valera = new Valera(
            alcohol: 20,
            cheerfulness: 0,
            fatigue: 20);

        valera.ContemplateNature();

        Assert.Equal(1, valera.Cheerfulness);
        Assert.Equal(10, valera.Alcohol);
        Assert.Equal(30, valera.Fatigue);
    }

    [Fact]
    public void DrinkWine_ShouldChangeState()
    {
        var valera = new Valera(
            health: 100,
            alcohol: 0,
            cheerfulness: 5,
            fatigue: 0,
            money: 50);

        var result = valera.DrinkWineAndWatchSeries();

        Assert.True(result);
        Assert.Equal(95, valera.Health);
        Assert.Equal(30, valera.Alcohol);
        Assert.Equal(4, valera.Cheerfulness);
        Assert.Equal(10, valera.Fatigue);
        Assert.Equal(30, valera.Money);
    }

    [Fact]
    public void GoToBar_ShouldChangeState()
    {
        var valera = new Valera(
            health: 100,
            alcohol: 0,
            cheerfulness: 0,
            fatigue: 0,
            money: 150);

        var result = valera.GoToBar();

        Assert.True(result);
        Assert.Equal(90, valera.Health);
        Assert.Equal(60, valera.Alcohol);
        Assert.Equal(1, valera.Cheerfulness);
        Assert.Equal(40, valera.Fatigue);
        Assert.Equal(50, valera.Money);
    }

    [Fact]
    public void DrinkWithMarginalPeople_ShouldChangeState()
    {
        var valera = new Valera(
            health: 100,
            alcohol: 0,
            cheerfulness: 0,
            fatigue: 0,
            money: 200);

        var result = valera.DrinkWithMarginalPeople();

        Assert.True(result);
        Assert.Equal(20, valera.Health);
        Assert.Equal(90, valera.Alcohol);
        Assert.Equal(5, valera.Cheerfulness);
        Assert.Equal(80, valera.Fatigue);
        Assert.Equal(50, valera.Money);
    }

    [Fact]
    public void SingInMetro_ShouldGiveMoney()
    {
        var valera = new Valera(
            alcohol: 0,
            money: 0);

        valera.SingInMetro();

        Assert.Equal(10, valera.Money);
        Assert.Equal(10, valera.Alcohol);
        Assert.Equal(20, valera.Fatigue);
    }

    [Fact]
    public void SingInMetro_ShouldGiveAdditionalMoney()
    {
        var valera = new Valera(
            alcohol: 50,
            money: 0);

        valera.SingInMetro();

        Assert.Equal(60, valera.Money);
    }

    [Fact]
    public void Sleep_ShouldRestoreHealth()
    {
        var valera = new Valera(
            health: 50,
            alcohol: 20,
            cheerfulness: 5,
            fatigue: 80);

        valera.Sleep();

        Assert.Equal(100, valera.Health);
        Assert.Equal(0, valera.Alcohol);
        Assert.Equal(5, valera.Cheerfulness);
        Assert.Equal(10, valera.Fatigue);
    }

    [Fact]
    public void Sleep_ShouldDecreaseCheerfulness_WhenAlcoholHigh()
    {
        var valera = new Valera(
            health: 100,
            alcohol: 80,
            cheerfulness: 5,
            fatigue: 80);

        valera.Sleep();

        Assert.Equal(2, valera.Cheerfulness);
        Assert.Equal(30, valera.Alcohol);
        Assert.Equal(10, valera.Fatigue);
    }

    [Fact]
    public void Health_ShouldNotBeNegative()
    {
        var valera = new Valera(
            health: 10,
            money: 200);

        valera.DrinkWithMarginalPeople();

        Assert.Equal(0, valera.Health);
    }
}