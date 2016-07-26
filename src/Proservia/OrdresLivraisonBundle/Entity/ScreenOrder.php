<?php
namespace Proservia\OrdresLivraisonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use DateTime;
use Symfony\Component\Validator\Constraints\Date;

/**
 * @ORM\Table(name="edf_orders_screens")
 * @ORM\Entity(repositoryClass="Proservia\OrdresLivraisonBundle\Repository\ScreenOrderRepository")
 */
class ScreenOrder
{
    /** @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=false, unique=true)
     */
    protected $name;

    /** @var string
     * @ORM\Column(type="string")
     */
    protected $date;

    /** @var int
     * @ORM\Column(type="integer")
     */
    protected $site;

    /** @var int
     * @ORM\Column(type="integer")
     */
    protected $numOfTheDay;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $qt24bd1;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $qt24bd2;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $qt22bd1;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $qt22bd2;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $qt19bd1;

    /**
     * @var string
     * @ORM\Column(type="text", nullable=true)
     */
    protected $comments;

    /**
     * @var string
     * @ORM\Column(type="integer", length=1, nullable=true, options={"default":0})
     */
    protected $isArchived;

    /**
     * @var DateTime
     * @ORM\Column(type="datetime", nullable=true)
     */
    protected $createdAt;

    /**
     * @var DateTime
     * @ORM\Column(type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     * @return ScreenOrder
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @return ScreenOrder
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * @param DateTime $date
     * @return ScreenOrder
     */
    public function setDate($date)
    {
        $this->date = $date;
        return $this;
    }

    /**
     * @return int
     */
    public function getSite()
    {
        return $this->site;
    }

    /**
     * @param int $site
     * @return ScreenOrder
     */
    public function setSite($site)
    {
        $this->site = $site;
        return $this;
    }

    /**
     * @return int
     */
    public function getNumOfTheDay()
    {
        return $this->numOfTheDay;
    }

    /**
     * @param int $numOfTheDay
     * @return ScreenOrder
     */
    public function setNumOfTheDay($numOfTheDay)
    {
        $this->numOfTheDay = $numOfTheDay;
        return $this;
    }

    /**
     * @return int
     */
    public function getQt24bd1()
    {
        return $this->qt24bd1;
    }

    /**
     * @param int $qt24bd1
     * @return ScreenOrder
     */
    public function setQt24bd1($qt24bd1)
    {
        $this->qt24bd1 = $qt24bd1;
        return $this;
    }

    /**
     * @return int
     */
    public function getQt24bd2()
    {
        return $this->qt24bd2;
    }

    /**
     * @param int $qt24bd2
     * @return ScreenOrder
     */
    public function setQt24bd2($qt24bd2)
    {
        $this->qt24bd2 = $qt24bd2;
        return $this;
    }

    /**
     * @return int
     */
    public function getQt22bd1()
    {
        return $this->qt22bd1;
    }

    /**
     * @param int $qt22bd1
     * @return ScreenOrder
     */
    public function setQt22bd1($qt22bd1)
    {
        $this->qt22bd1 = $qt22bd1;
        return $this;
    }

    /**
     * @return int
     */
    public function getQt22bd2()
    {
        return $this->qt22bd2;
    }

    /**
     * @param int $qt22bd2
     * @return ScreenOrder
     */
    public function setQt22bd2($qt22bd2)
    {
        $this->qt22bd2 = $qt22bd2;
        return $this;
    }

    /**
     * @return int
     */
    public function getQt19bd1()
    {
        return $this->qt19bd1;
    }

    /**
     * @param int $qt19bd1
     * @return ScreenOrder
     */
    public function setQt19bd1($qt19bd1)
    {
        $this->qt19bd1 = $qt19bd1;
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param DateTime $createdAt
     * @return ScreenOrder
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param DateTime $updatedAt
     * @return ScreenOrder
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return string
     */
    public function getIsArchived()
    {
        return $this->isArchived;
    }

    /**
     * @param string $isArchived
     * @return ScreenOrder
     */
    public function setIsArchived($isArchived)
    {
        $this->isArchived = $isArchived;
        return $this;
    }

    /**
     * @return string
     */
    public function getComments()
    {
        return $this->comments;
    }

    /**
     * @param string $comments
     * @return ScreenOrder
     */
    public function setComments($comments)
    {
        $this->comments = $comments;
        return $this;
    }
}