<?php
namespace Proservia\OrdresLivraisonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use DateTime;
use Symfony\Component\Validator\Constraints\Date;

/**
 * @ORM\Table(name="edf_orders_specifique")
 * @ORM\Entity(repositoryClass="Proservia\OrdresLivraisonBundle\Repository\SpecifiqueOrderRepository")
 */
class SpecifiqueOrder
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
    protected $fixe1;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $fixe2;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $fixeBoost1;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $fixeBoost2;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $portable1;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $portable2;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $portableBoost1;

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
     * @return SpecifiqueOrder
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
     * @return SpecifiqueOrder
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * @param string $date
     * @return SpecifiqueOrder
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
     * @return SpecifiqueOrder
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
     * @return SpecifiqueOrder
     */
    public function setNumOfTheDay($numOfTheDay)
    {
        $this->numOfTheDay = $numOfTheDay;
        return $this;
    }

    /**
     * @return int
     */
    public function getFixe1()
    {
        return $this->fixe1;
    }

    /**
     * @param int $fixe1
     * @return SpecifiqueOrder
     */
    public function setFixe1($fixe1)
    {
        $this->fixe1 = $fixe1;
        return $this;
    }

    /**
     * @return int
     */
    public function getFixe2()
    {
        return $this->fixe2;
    }

    /**
     * @param int $fixe2
     * @return SpecifiqueOrder
     */
    public function setFixe2($fixe2)
    {
        $this->fixe2 = $fixe2;
        return $this;
    }

    /**
     * @return int
     */
    public function getFixeBoost1()
    {
        return $this->fixeBoost1;
    }

    /**
     * @param int $fixeBoost1
     * @return SpecifiqueOrder
     */
    public function setFixeBoost1($fixeBoost1)
    {
        $this->fixeBoost1 = $fixeBoost1;
        return $this;
    }

    /**
     * @return int
     */
    public function getFixeBoost2()
    {
        return $this->fixeBoost2;
    }

    /**
     * @param int $fixeBoost2
     * @return SpecifiqueOrder
     */
    public function setFixeBoost2($fixeBoost2)
    {
        $this->fixeBoost2 = $fixeBoost2;
        return $this;
    }

    /**
     * @return int
     */
    public function getPortable1()
    {
        return $this->portable1;
    }

    /**
     * @param int $portable1
     * @return SpecifiqueOrder
     */
    public function setPortable1($portable1)
    {
        $this->portable1 = $portable1;
        return $this;
    }

    /**
     * @return int
     */
    public function getPortable2()
    {
        return $this->portable2;
    }

    /**
     * @param int $portable2
     * @return SpecifiqueOrder
     */
    public function setPortable2($portable2)
    {
        $this->portable2 = $portable2;
        return $this;
    }

    /**
     * @return int
     */
    public function getPortableBoost1()
    {
        return $this->portableBoost1;
    }

    /**
     * @param int $portableBoost1
     * @return SpecifiqueOrder
     */
    public function setPortableBoost1($portableBoost1)
    {
        $this->portableBoost1 = $portableBoost1;
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
     * @return SpecifiqueOrder
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
     * @return SpecifiqueOrder
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
     * @return SpecifiqueOrder
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
     * @return SpecifiqueOrder
     */
    public function setComments($comments)
    {
        $this->comments = $comments;
        return $this;
    }
}