namespace ValeraApi.Models;

public class Valera
{
    public int Health { get; private set; }
    public int Alcohol { get; private set; }
    public int Cheerfulness { get; private set; }
    public int Fatigue { get; private set; }
    public decimal Money { get; private set; }

    public Valera(
        int health = 100,
        int alcohol = 0,
        int cheerfulness = 0,
        int fatigue = 0,
        decimal money = 0)
    {
        Health = Math.Clamp(health, 0, 100);
        Alcohol = Math.Clamp(alcohol, 0, 100);
        Cheerfulness = Math.Clamp(cheerfulness, -10, 10);
        Fatigue = Math.Clamp(fatigue, 0, 100);
        Money = Math.Max(0, money);
    }

    //пойти на работу
    public bool GoToWork()
    {
        if (Alcohol >= 50 || Fatigue >= 10)
            return false;

        Cheerfulness -= 5;
        Alcohol -= 30;
        Money += 100;
        Fatigue += 70;

        Normalize();
        return true;
    }

    //созерцать природу
    public void ContemplateNature()
    {
        Cheerfulness += 1;
        Alcohol -= 10;
        Fatigue += 10;

        Normalize();
    }

    //пить пиво и смотреть сериал
    public bool DrinkWineAndWatchSeries()
    {
        if (Money < 20)
            return false;

        Cheerfulness -= 1;
        Alcohol += 30;
        Fatigue += 10;
        Health -= 5;
        Money -= 20;

        Normalize();
        return true;
    }

    //сходить в бар
    public bool GoToBar()
    {
        if (Money < 100)
            return false;

        Cheerfulness += 1;
        Alcohol += 60;
        Fatigue += 40;
        Health -= 10;
        Money -= 100;

        Normalize();
        return true;
    }

    //выпить
    public bool DrinkWithMarginalPeople()
    {
        if (Money < 150)
            return false;

        Cheerfulness += 5;
        Health -= 80;
        Alcohol += 90;
        Fatigue += 80;
        Money -= 150;

        Normalize();
        return true;
    }

    //петь в метро
    public void SingInMetro()
    {
        int initialAlcohol = Alcohol;

        Cheerfulness += 1;
        Alcohol += 10;
        Money += 10;
        Fatigue += 20;

        if (initialAlcohol > 40 && initialAlcohol < 70)
        {
            Money += 50;
        }

        Normalize();
    }

    //спать
    public void Sleep()
    {
        if (Alcohol < 30)
        {
            Health += 90;
        }

        if (Alcohol > 70)
        {
            Cheerfulness -= 3;
        }

        Alcohol -= 50;
        Fatigue -= 70;

        Normalize();
    }

    private void Normalize()
    {
        Health = Math.Clamp(Health, 0, 100);
        Alcohol = Math.Clamp(Alcohol, 0, 100);
        Cheerfulness = Math.Clamp(Cheerfulness, -10, 10);
        Fatigue = Math.Clamp(Fatigue, 0, 100);
        Money = Math.Max(0, Money);
    }
}